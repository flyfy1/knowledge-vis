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

Keep algorithmic state distinct from the current operation, inspected item,
and keyboard focus. When applicable meanings overlap on one item, preserve a
visible way to identify each; one state style must not erase another meaning
promised by the legend or explanation. Use an appropriate text label, shape,
or other distinguishable treatment consistent with existing accessibility
rules. No particular color, ring, layered-outline technique, or new widget is
required. Keyboard focus identifies the control receiving input; it must not
silently redefine the algorithm's current item.

Check an actual overlapping frame, comparing the current item with another
item in the same algorithmic state when such a comparison exists. Inspect the
rendered markers and their meaning after CSS and rendering, in both locales
and through rewind/replay; check focus overlap only where applicable. The
presence of a class or `data-current` attribute alone cannot prove that its
marker remains visible. Use a targeted assertion for the rendered
representation plus visual inspection, and retain the state/actions, expected
distinction and observed result. Scope this to applicable overlaps; an
exhaustive state matrix or new test framework is not required.

For horizontally scrolling tables with opaque sticky row/corner headers, each
complete column identity must be exposable at a reachable scroll position beside
the sticky area, with its values and row association intact. Inspect actual text
line rectangles and settled screenshots at left/middle/right offsets, especially
the terminal column; cell boxes, DOM text and no page overflow do not prove glyph
visibility. Temporary clipping during scrolling is acceptable if the full label
can be exposed. Let complete labels wrap and height grow; do not erase an index,
shrink type or remove essential sticky association merely to pass the check.
The [1092 failure](reviews/1092-round1-required-20261026/1092-review-1-206ef9e2.md)
and [repair contract](reviews/1092-header-fit-design-review-20261026.md) establish
the missing `8 ·` case; the [independent Linux closure][1092-closure] reproduces
the original red case and checks the repaired text lines. Retain section 8's
affected-platform requirement; CSS zoom is layout stress, not native-device proof.

Check the actual disabled appearance at initial and terminal controls, including
primary buttons. A native `disabled` property alone does not prove that the CSS
cascade removed the enabled primary treatment. Inspect computed colors/opacity
and the screenshot: unavailable actions must be visibly distinguishable while
their labels remain legible. The #1095 evidence below records this specificity
defect as an author correction before its candidate freeze, not a reviewer finding.

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

When testing fallback-to-success recovery, restore the real clipboard capability
and invoke the real Copy control. Await that attempt's observed asynchronous
success (for example, the localized success status replacing fallback feedback),
then check source readback and that the handler hides the fallback with consistent
status. Do not hide/remove fallback DOM or clear its status in the test to create
a passing cleanup state. Injecting clipboard failure is a controlled test setup;
manufacturing the asserted recovery is not. The #1095 author notes below preserve
both this capture artifact and the premature assertion before clipboard completion.

For manual fallback copying, use the operating system hosting the browser's
actual shortcut: Meta+C on macOS, Control+C on Linux/Windows. Locale, mobile
viewport and user-agent emulation do not establish that host. A local runner
can supply its host platform; record it explicitly for a remote browser rather
than inferring it from the test client's platform.

Before **each** manual-fallback transfer attempt, including each locale or
repeated attempt inside a loop, write a fresh, distinct non-source clipboard
sentinel and read it back to verify that reset succeeded. Do this before
disabling automatic writes for the fallback test. Then invoke the real Copy
control, check focus and full selection, dispatch the host's actual copy action,
and read back the canonical source exactly. Seeding once outside a locale loop
is insufficient: a failed later copy could otherwise reuse the previous source.
Do not substitute a test-written source value, DOM-only selection checks, or
weakened equality. If reset or readback cannot be verified, record the gap
instead of claiming that attempt transferred the source. Preserve the newline
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

Preserve enough responsive width for the label itself: reflow a tile/grid before
forcing its text into an unreadable column, and inspect local label bounds rather
than only document overflow. For a compact numeric scenario selector, keep a
complete localized description immediately adjacent, associate it accessibly
(for example with `aria-describedby`), and update it with selection and locale.
The number and opened option menu alone cannot supply the scenario's meaning.
Verify the closed value, native arrow and adjacent description at the constrained
width/zoom; retain legible type and the existing conservative width check.

Measure actual rendered text, padding and control width, allowing room for the
native arrow, then inspect the screenshot. Any numerical arrow allowance belongs
to that recorded control/browser; the incident's 16px is not a universal constant.
Record browser/platform and the CSS
font stack. Identical CSS stacks do not prove identical available fonts or glyph
widths: the #587 labels fit on Pi but clipped on Mac with the same 260px control.
Do not infer an exact resolved font solely from the stack or attribute every
platform difference to one unverified font.

A failed width-budget assertion establishes a failed predicate, not by itself
visible clipping. Compare the computed font measurement with a rendered-text
measurement and inspect the closed control. If they disagree, diagnose the
measurement; if a conservative reserve fails while the label remains complete,
record both facts. A deliberately overlong diagnostic label can check whether
the capture exposes clipping, but it is not lesson content or evidence that the
original label clips. Do not lower the arrow reserve or waive an existing failed
check merely to obtain a pass. Shorter equivalent copy may provide margin while
retaining the original predicate; preserve the count, scope and purpose, create
a new candidate, and verify the original case and full relevant suite against it.

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

Evidence for the #1095 responsive, disabled-style and copy-recovery clarifications:
[pre-freeze author development checks][1095-author] distinguish product repairs
from harness/capture corrections; the [independently accepted report][1095-review]
checks the resulting candidate's readable labels, disabled controls and real
fallback-to-success behavior. These were not reviewer-raised required findings,
and adding this guidance does not change either historical review or live policy.

## 9. Check cost bounds at valid parameter boundaries

Define each complexity parameter and its counting convention beside the claim.
For a bound with several independent parameters, check whether one can be zero
while input processing, output materialization, or base-level work remains large.
Use the actual displayed baseline as well as the canonical implementation; a
correct optimized solution does not make an incorrect baseline explanation valid.

For example, let n be formula length, A the number of expanded atom entries, and
d the maximum number of enclosing parentheses, so d=0 without parentheses. An
expansion baseline still constructs and tallies A entries for `H1000`. For this
expansion/tally stage before sorting, the bound
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

## 10. Calibrate numerical accessibility checks before trusting their verdict

When a lesson's custom test computes contrast, verify the actual measurement
function against independent known values before relying on its pass/fail result.
For sRGB, use the [WCAG relative-luminance definition](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance):
linearized channel weights are 0.2126, 0.7152 and 0.0722. Black has luminance 0,
white 1, and their contrast ratio is 21. Include the primary colors and a case
near the relevant threshold so a small coefficient error cannot silently pass.
For example, #747474 on black is approximately 4.492948: it fails a 4.5 threshold
without rounding up. An incorrect green weight of 0.7322 reports approximately
4.552328 and incorrectly passes that same pair.

Exercise the function used by the browser check, not an unused replacement with
the correct constants. When repairing a reproduced defect, preserve a red result
against the defective function and a passing result against its repair. Recompute the actual recorded colors or
rerun the rendered-state measurement to distinguish a faulty test from a faulty
palette. Do not claim a product contrast failure from the calculation bug alone,
or silently replace the historical test result with corrected evidence.

Continue applying the existing accessibility scope and applicable thresholds;
this section does not redefine which text is large, which controls are exempt,
or how to measure transparency, gradients and composited backgrounds. A check
that only supports solid colors must identify that limit rather than pretend
to establish contrast for unsupported effects. Record candidate, tested colors,
formula/reference, threshold and unrounded ratio with the result. Browser and
state coverage still need their own evidence.

This is a bounded check of a correctness-critical measurement helper, not a new
accessibility framework or exhaustive testing campaign. It adds no runtime
library, rubric dimension or retroactive acceptance change. A reproduced test
defect follows the ordinary repair and independent re-review procedure. Adopt
this clarification for future candidates at a stopped boundary, retaining the
shared-policy identity and historical results of already frozen candidates.

## 11. Verify lesson identity in the rendered bilingual heading

Check the actual visible H1 after selecting each locale, including a zh → en → zh
roundtrip at a supported narrow width. It must contain the official problem
number clearly and the corresponding localized title from the reviewed lesson
metadata, for example `#239 · 滑动窗口最大值`. A number in the browser title,
eyebrow, collection card or URL does not substitute for the H1. Check the document
title's localized identity too, and retain the exact official LeetCode problem
URL. Language switching must preserve the existing teaching interaction state.

Assert the expected localized strings, not merely that a heading exists or that
the Chinese view still contains the English title. #262's former assertion that
the Chinese H1 contained `Trips` accepted an English-only title and therefore
could not detect the defect. Preserve the meaningful interaction and source
parity checks when repairing such an assertion. A new regression for a reproduced
failure must fail against the defective candidate and pass against the repair.

Some formal names legitimately match in both locales; the reviewed Chinese and
English names for #502 are both `IPO`. Do not require every pair of headings to
differ. Allow identical titles when both reviewed metadata values are identical,
while independently inspecting translated explanatory content and language
controls. Changed main text is a useful publication smoke check, but does not
prove that every sentence is correctly translated. Independent lesson review
still checks the actual bilingual explanation.

A public title failure reopens that lesson for a real repair and fresh separate
review. Retain its prior acceptance as history. A publication-check false
positive instead requires a focused red-capable check and independent review of
the gate correction; it does not waive other lesson defects or establish public
delivery. Successful release accounting follows the original full public hash
and browser verification gates. This clarification adds no rubric dimension or
retroactive re-review campaign; adopt it for subsequent candidates at an idle
campaign boundary and preserve already frozen policy identities.

## 12. Check the concept promised by a related link

For each related-concept link added or changed by a candidate, inspect the actual
rendered label and destination in both languages. Follow the rendered link and
read the destination section. A successful response and an existing fragment are
necessary structural checks, but do not prove that the section explains the
advertised concept. Check that the destination is available in the intended
served collection; a source file existing only in an author's checkout is not a
usable published continuation. Prefer an already available destination. If a target
is intended to ship in the same batch, record its accepted candidate and confirm
its inclusion in the selected release manifest before deployment. Verify the actual
target after publication before claiming that the navigation works. The current
publisher excludes inter-lesson navigation from its runtime-asset dependency scan;
that scan alone cannot prove the destination is served. Do not silently ship a
broken prerequisite or weaken the existing release checks.

Use precise labels that describe what the learner can actually study there.
Shared data structures do not imply interchangeable operations or solutions:
#84's monotonic-stack pop settles a rectangle boundary, whereas #239's deque pop
discards a candidate that cannot win. #327 teaches subtracting prefix sums to
obtain a range sum; it does not teach obtaining a sliding-window maximum that way.
These are examples of truthful distinctions, not mandatory destinations or copy.

Retain the source candidate, locale, rendered label, resolved URL and fragment,
and a brief observed destination explanation, including the target revision or
release identity when available. Exercise keyboard activation and
the longer localized label at the existing narrow-width target. When repairing a
reproduced mismatch, preserve a regression that rejects the old label/target and
passes after repair. A text/href assertion can detect recurrence, while an
independent reading of the target establishes meaning; neither replaces the other.
No universal semantic matcher or exhaustive cross-site scan is required.

Classify findings under the existing rubric according to their teaching impact.
An ancillary navigation advisory does not automatically invalidate a previously
accepted core algorithm or rewrite its score. When the dispatcher selects that
advisory for repair, create a new candidate and obtain fresh separate review of
the closure and preserved behavior. Keep historical reviews and release receipts.
Adopt this clarification at a recorded idle boundary for subsequent candidates;
already frozen candidates retain their recorded shared-policy identity.

## Repeated-copy and fit-evidence clarification

The section 4 per-attempt sentinel requirement and section 8 conservative-budget
classification were independently reviewed in the [proposal review](reviews/repeat-copy-and-fit-spec-review-20261025.md).
See the [proposal](proposals/leetcode-repeat-copy-and-fit-evidence-20261025.md) and
[dispatcher adoption status](reviews/repeat-copy-and-fit-spec-adoption-20261025.md).
These local changes do not alter already frozen central candidates; operational
adoption must be recorded separately before new campaign work uses them.

[1092-closure]: https://github.com/flyfy1/knowledge-vis/blob/1ece9d85ac55b3bd5a6855176141aab899c73f73/specs/reviews/1092-review-2-de6dcb3c.md
[1095-author]: https://github.com/flyfy1/knowledge-vis/blob/eaddb1bcea4ead30c8b703d2e4d6c8010e245d93/leetcode/1095/tests/evidence/development-notes.md
[1095-review]: https://github.com/flyfy1/knowledge-vis/blob/c9a04e2181d16fa8752221cea443e2cecafef014/specs/reviews/1095-review-1-8193a17b.md
