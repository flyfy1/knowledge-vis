# Independent document review: selected-label font metrics

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Scope: the proposed specification and its archived evidence only. No lesson
acceptance, policy adoption, runtime edits, or fresh browser execution is claimed.

Reviewed proposal SHA-256:
`88255e9f9b4f27db8ce6b7bdd1afa57508ddc71a81e4dc83cc205e8e88a8bac7`.
Compared with rendered-state contract SHA-256:
`030ace4d159421e87948af998f42db698d9823dbc4a12aa0c6747e41143a2f31`.

**Recommendation: adopt after the stated safe integration boundary. Required
findings: none.** The proposal makes the existing readability and count-scope
requirements testable without changing the rubric or creating a platform matrix.
The affected-platform rerun applies to a concrete observed regression; ordinary
candidate checks remain bounded to constrained labels, both locales and a locale
roundtrip. Synthetic stress is correctly distinguished from native evidence.

I checked the [failure report](587-review-dispatcher-mac-20261025.md),
[repair verification](587-review-mac-verification-20261025.md), archived Mac/Pi
measurement records, diagnostic experiments, repaired candidate receipt and
original regression results. The three Mac failures at 320px and corresponding
Pi passes support the width-budget claim. The repaired measurement records pass,
with a minimum spare width of 18.37px. The archived original regression is byte
identical to the test in candidate `f5816b88f3e7e280e4c89878a0e6490d1a3522e6`;
its repaired run records 72 states. I inspected the archived failing and repaired
English preset-5 screenshots at 320px: the former clips the tree scope and the
latter displays the full label and arrow. These support the proposal's rationale,
without identifying an unverified resolved font or proving physical-phone or
public-delivery behavior.

## Advisory refinements

- **FM-A1 — Make the evidence handoff explicit.** When a different machine runs
  the affected-platform reproduction, link its candidate receipt, unchanged test,
  results and screenshot in the repair evidence available to the independent
  reviewer. Preserve a pending state until that evidence is available; a reviewer
  need not own every platform. The current contract already preserves candidate
  and finding IDs, so this is an operational clarification, not a new gate.
- **FM-A2 — Keep arrow allowances contextual.** State that any numerical arrow
  allowance belongs to the recorded control/browser, with screenshot inspection
  resolving visual completeness. The 16px allowance in this incident should not
  become a universal constant for all native controls. No extra font inventory or
  exhaustive browser testing is needed.

The proposal's future-candidate scope and ordinary repair path for concrete new
defects are consistent with the existing contract. Keep historical review
outcomes unchanged and retain this document as a specification review only.
