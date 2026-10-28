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

The new slug is intentionally isolated from the existing `bayes/` lesson so the parent checkout can choose whether to merge or compare it. No external network, chart library, or runtime dependency is required.
