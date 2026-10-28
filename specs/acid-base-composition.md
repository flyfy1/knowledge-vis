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
