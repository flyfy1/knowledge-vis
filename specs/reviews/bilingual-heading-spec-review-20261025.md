# Independent document review: bilingual heading identity

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Scope: section 11 of `leetcode-rendered-state-contract.md` only, assessed against
the [239 finding](239-review-public-title-20261025.md),
[262 finding](262-review-public-title-20261025.md), and
[publisher correction review](publisher-bilingual-heading-review-20261025.md).
Reviewed section SHA-256:
`48eaaabe3aef442b879a50b8fbb6b8a232a4ad73e15dc8b07820bf6c45da55ba`.
This review assesses the specification and recorded reasoning; it does not rerun
browser tests, verify a repair, or establish public delivery.

**Verdict: approve. Required findings: none.** The section captures the distinct
failures without conflating lesson repair with correction of a publication test.

The visible H1 requirement follows the explicit problem-number requirement and
does not allow a number elsewhere to satisfy it. Both localized heading and
document-title expectations are tied to reviewed metadata. This catches #239's
missing ID and #262's English-only Chinese heading, including the ineffective
assertion that previously expected `Trips`. The required roundtrip, narrow-width
inspection and preserved teaching state are bounded checks relevant to those
defects. Reproducing red then green and retaining source/interaction assertions
prevents repairing the test by removing its meaningful coverage.

The identical-title allowance is appropriately conditional. It permits reviewed
formal names such as `IPO`, while the preceding exact localized-identity
requirement still applies: two matching but incorrect headings do not qualify.
Changed main text remains explicitly a smoke signal, not proof of complete or
correct translation. Semantic inspection stays with independent lesson review;
the publication gate does not inherit that responsibility or replace it.

The repair and adoption boundaries are sound. Real lesson defects require a new
candidate and fresh separate review; the publisher false positive instead needs
a focused regression and independent gate review. Neither route advances release
accounting without the existing public hash and browser gates. Historical
acceptance remains history, and the text creates no retrospective rescoring or
blanket re-review requirement.

Adopt only at an idle campaign boundary, preserving active/frozen candidates'
recorded policy identities. No active remote repair should receive this policy
mid-run. As an optional documentation improvement, link the three incident
reports from section 11 so future readers can trace its examples directly.

Only this review file was written. No specification, code, campaign state,
remote checkout, commit, or deployment was changed.
