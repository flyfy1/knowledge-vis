# Bayes Diagnostics · bilingual knowledge slice

## Deliverable

`bayes-diagnostics/` is a self-contained, dependency-free bilingual lesson for **Bayesian inference in diagnostic testing**. It is designed to be copied into the knowledge-vis lesson collection as a new route/slug; it does not modify the existing `bayes/` route.

## Teaching chain

1. **Prior** — a 1,000-person population bar makes prevalence visible before any test result.
2. **Likelihood** — sensitivity and specificity sliders split the ill and healthy groups into true/false positives and negatives.
3. **Posterior** — positive/negative result buttons select the relevant denominator and update PPV/NPV, with a frequency tree and formula.
4. **Misconception feedback** — a focused quiz explicitly contrasts `P(+|H)` with `P(H|+)` and points back to the denominator.

## Interaction contract

- `prior`: 1–30 percentage points, default 1%.
- `sens`: 50–100%, default 90%.
- `spec`: 50–100%, default 91%; false-positive rate is `1 - specificity`.
- Population base is fixed at 1,000 for exact, inspectable counts.
- Positive posterior is `TP / (TP + FP)`; negative posterior is `TN / (TN + FN)`.
- Language toggle changes static and dynamic copy without resetting controls.
- Reset returns to 1% / 90% / 91% and positive result.

## Scope / limits

This is a teaching model using rounded frequency counts; it is not a clinical calculator or medical advice. The copy intentionally keeps the event direction in every formula so “sensitivity = posterior” is visible as a denominator error.
