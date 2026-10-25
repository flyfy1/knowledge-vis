# Independent document review: cost boundaries and contrast calibration

Date: 2026-10-25. Reviewer: separate agent `font_metrics_spec_review`.
Scope: sections 9 and 10 of `leetcode-rendered-state-contract.md`, reviewed file
SHA-256 `6ebfd17bfaf39a67dad61d291c1cd60011b4b27c0209a5bb49d44d7a696481a1`.
This is a specification review, not lesson acceptance or campaign adoption.

**Verdict: suitable for adoption at the specified safe boundary. Required
findings: none.** Keep both sections main-only until the frozen #732 lane is
imported. Adopt only while the campaign is stopped; preserve the policy identity
of every already frozen candidate and all historical results.

Section 9 correctly exposes the missing base-level expansion/tally work when
parenthesis depth is zero. Its examples use valid parameter values, distinguish
expanded size from input length, and do not mistake finite allocations or correct
outputs for asymptotic proof. The [726 repair receipt](726-review-mac-repair-20261025.md)
and [independent closure](726-review-2-580d1540.md) support this diagnosis. Small
boundary examples and inspection of the actual loops are a bounded check, not an
instruction to benchmark every lesson or mechanically change every formula.

Section 10's coefficients and numerical example agree with the official
[WCAG luminance](https://www.w3.org/TR/WCAG22/#dfn-relative-luminance) and
[contrast-ratio definitions](https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio).
An independent arithmetic recomputation gives 4.492948073111701 for #747474 on
black and 4.5523281903546 with the erroneous green coefficient. I inspected the
[732 finding](732-review-mac-candidate-20261025.md) and its linked extraction script
and red calibration JSON: the script evaluates the candidate's actual luminance
function, and white/green and the threshold witness expose its defect. This does
not establish a palette failure, repair closure or complete browser coverage;
the proposed wording correctly preserves those distinctions.

Neither section changes scores, acceptance thresholds, source parity or
independent review requirements. New reproduced defects follow the ordinary
repair path; historical outcomes are not silently rescored or rewritten.

## Bounded recommendations

- In section 9, make the example's construction/tally scope explicit with
  “before sorting.” The actual bilingual #726 explanation and independent review
  retain this qualifier; carrying it into the supplement prevents readers from
  treating this illustrative bound as the entire output-serialization cost.
- In section 10, introduce the red/green preservation sentence with “When repairing
  a reproduced defect.” Correct helpers still need calibration, but need not
  acquire an artificial broken revision solely to satisfy the wording.

These are clarifications within the existing scope. No broader platform matrix,
new accessibility framework, runtime change or retroactive review is recommended.
Only this review file was written; no specification, campaign state, implementation,
commit or deployment was changed. No new browser test execution is claimed.
