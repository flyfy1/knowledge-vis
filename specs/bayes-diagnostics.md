# Bayes diagnostics slice · implementation spec

## Acceptance criteria

- [x] Bilingual static copy exists for title, controls, formula, feedback, and quiz.
- [x] Prior slider updates the 1,000-person population layer.
- [x] Sensitivity and specificity sliders update TP/FN/FP/TN and expose false-negative and false-positive rates.
- [x] Positive and negative result controls switch the selected denominator and posterior readout.
- [x] Frequency tree renders positive and negative pools with labeled segments.
- [x] Misconception quiz gives a corrective explanation naming conditional-probability direction.
- [x] Reset and language toggle preserve/restore expected state.
- [x] Focused math test covers accounting identities, PPV/NPV, prevalence movement, and perfect-test bounds.

## Review notes

The new slug is intentionally isolated from the existing `probability/inference/bayes-updating/` lesson so the parent checkout can choose whether to merge or compare it. No external network, chart library, or runtime dependency is required.

## Change 2026-11-17: this spec describes a replaced page

The four-card lesson this spec describes was replaced at `probability/inference/bayes-diagnostics/` by the seven-step
Claude Code edition (commit a3a44e7d; comparison in [reviews/lesson-version-choice-20261117.md](reviews/lesson-version-choice-20261117.md)).
The anchors changed: `#step-prior`, `#step-likelihood`, `#step-posterior` no longer exist; the links into them moved
to `#step1`, `#step2`, `#step3` in the same commit (atlas `positive-predictive-value`, numbers-lie ch6). The old page's
template blockers (runtime without `data-i18n-html`, non-`stepN` ids) went with it; the page is a site-template page since
0e474801. The current contract is `probability/inference/bayes-diagnostics/BRIEF.md` and `tests/core.cjs`; the old code is
at `git show 5173122d:probability/inference/bayes-diagnostics/app.js`. Check after any change to this page:
`git grep 'bayes-diagnostics/#step-'` must be empty.
