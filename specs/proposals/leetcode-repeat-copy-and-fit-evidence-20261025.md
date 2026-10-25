# Repeated copy attempts and native-select evidence

Status: proposed; independent review and an explicit campaign adoption boundary
are required before this changes author/reviewer guidance. It clarifies existing
source-transfer and readability checks; it adds no scoring dimension or runtime.

## Evidence and narrow scope

[745 independent copy review](../reviews/745-review-mac-copy-adapter-20261025.md)
identified a false-pass path: after one successful copy, a second locale can read
the previous canonical source even if its own copy did nothing. Its separate probe
reset and verified a fresh sentinel per locale and closed that exact candidate's
coverage gap. This is a test-evidence finding, not a newly established runtime bug.

[765 independent diagnosis](../reviews/765-mac-fit-diagnosis-20261025.md) distinguished
a failed conservative width assertion from visible clipping: canvas and DOM
agreed, the label and arrow were complete in the screenshot, and an overlong
positive control did visibly clip. Shorter equivalent copy satisfied the original
predicate without relaxing it. The proposed formal candidate still needs review.

## Proposed section 4 replacement

Replace the paragraph beginning "Seed a distinct non-source clipboard sentinel"
in `specs/leetcode-rendered-state-contract.md` with:

> Before **each** manual-fallback transfer attempt, including each locale or
> repeated attempt inside a loop, write a fresh, distinct non-source clipboard
> sentinel and read it back to verify that reset succeeded. Do this before
> disabling automatic writes for the fallback test. Then invoke the real Copy
> control, check focus and full selection, dispatch the host's actual copy action,
> and read back the canonical source exactly. Seeding once outside a locale loop
> is insufficient: a failed later copy could otherwise reuse the previous source.
> Do not substitute a test-written source value, DOM-only selection checks, or
> weakened equality. If reset or readback cannot be verified, record the gap
> instead of claiming that attempt transferred the source. Preserve the newline
> conversion and exact mirror/download boundaries above.

## Proposed section 8 clarification

After the paragraph describing native-arrow allowance and platform fonts, add:

> A failed width-budget assertion establishes a failed predicate, not by itself
> visible clipping. Compare the computed font measurement with a rendered-text
> measurement and inspect the closed control. If they disagree, diagnose the
> measurement; if a conservative reserve fails while the label remains complete,
> record both facts. A deliberately overlong diagnostic label can check whether
> the capture exposes clipping, but it is not lesson content or evidence that the
> original label clips. Do not lower the arrow reserve or waive an existing failed
> check merely to obtain a pass. Shorter equivalent copy may provide margin while
> retaining the original predicate; preserve the count, scope and purpose, create
> a new candidate, and verify the original case and full relevant suite against it.

## Adoption and priorities

P0 is trustworthy evidence for actual source transfer and complete selected labels.
The highest-return change is one fresh sentinel per transfer attempt plus accurate
classification of a native-control failure. P1/P2 add no work. Defer universal
arrow constants, shared component redesign and blanket historical retesting: the
evidence does not justify them. Concrete newly observed regressions still require
their own repair and independent review.

After independent review, update only the two named paragraphs and cite this
proposal in the contract. Adopt into the running campaign at a safe boundary after
already frozen author/reviewer work is complete; preserve past scores, original
tests, and receipts. Local approval alone must not be described as live campaign
adoption. Record the exact policy revision and first eligible subsequent work.
