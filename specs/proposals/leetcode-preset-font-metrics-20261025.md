# Proposal: selected-label width across font environments

Status: adopted at the safe central integration boundary on 2026-10-25, after
lanes #629 and #630 using the previous shared policy were imported. The separate
[document review](../reviews/font-metrics-proposal-review-20261025.md) found no
required changes. Both advisory refinements are adopted below: explicit evidence
handoff and contextual native-arrow allowances. These clarify the reviewed scope.
This does not change the current rubric, acceptance thresholds or historical
reviews. Evidence: [587 Mac failure](../reviews/587-review-dispatcher-mac-20261025.md)
and [same-candidate repair verification](../reviews/587-review-mac-verification-20261025.md).

Proposed addition to `leetcode-rendered-state-contract.md`:

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
