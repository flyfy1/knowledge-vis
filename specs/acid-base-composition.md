# Acid–base common-ion composition chart

## Why this exists
The common-ion step already computed a quadratic equilibrium and moved particles, but the claim “the balance shifts left” was only visible as a number in the readout. Learners need a same-state comparison that separates the weak-acid dissociation fraction from the pH effect of the added A⁻.

## Required behavior
- Keep the existing particle simulation and common-ion slider unchanged.
- Render a before/after stacked bar for the same `Ka` and total weak-acid concentration: baseline `common = 0` versus the selected common ion.
- Label each bar with the dissociated share and pH. Cyan is undissociated HA; orange is the dissociated fraction; green text marks pH.
- Redraw the chart whenever the slider is moved, reset, the language changes, or the page is loaded.
- Keep the chart bilingual through the existing `knowledge-lang` preference and expose an `aria-label` on the canvas.

## Model boundary
`compositionData(state)` calls the same analytic `equilibrium()` solver as the step readout. The bar's fraction is `x / C` for the weak-acid species; added common-ion A⁻ is not counted as additional weak-acid total C. pH uses the resulting `[H⁺]`. Activity corrections, water autoionization, and temperature effects remain out of scope.

## Focused recurrence checks
- For `Ka = 0.01`, `C = 1`, increasing common ion from `0` to `0.8` lowers `dissociated` and raises pH.
- `compositionData()` baseline/current values match direct `equilibrium()` results and its delta is negative when the common ion is positive.
- Slider redraw does not change the number of particles or the analytic source of truth.
- `node acid-base-equilibrium/tests/core.cjs` and `node --check acid-base-equilibrium/app.js` pass.

## Change 2026-11-17: the page this spec describes was replaced

The five-step particle lesson with this common-ion composition chart was replaced at
`chemistry/solutions/acid-base-equilibrium/` by the six-step Claude Code edition (commit b383c6dc; comparison in
[reviews/lesson-version-choice-20261117.md](reviews/lesson-version-choice-20261117.md)). The new page treats the common
ion in its own step 3 with the same particle model as the rest of the page (no separate composition chart); its
contract is `chemistry/solutions/acid-base-equilibrium/BRIEF.md` and `tests/core.cjs`. The chart's code is at
`git show 5173122d:chemistry/solutions/acid-base-equilibrium/app.js`. Since 5ac069a2 the string table holds plain
strings (the 12 cross-page links used to be built by a helper `a()`), and since 5ac22d79 the page is a site-template page.
