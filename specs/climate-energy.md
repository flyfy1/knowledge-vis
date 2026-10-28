# Earth science slice: climate energy ledger

## Why this slice

Earth & Space already had plate motion and orbital motion, but lacked a short visual causal chain for climate. This lesson follows one beam of sunlight through latitude, surface reflection, and atmospheric infrared escape.

## Acceptance checks

1. `/climate-energy/` loads without external dependencies beyond the shared lesson shell.
2. Every step has one primary interaction and a visible readout.
3. Latitude changes the ray angle and relative insolation; `0°` remains a valid state.
4. Albedo conserves the incoming teaching energy: `reflected + absorbed = 100`.
5. Greenhouse opacity changes direct escape, effective temperature, and surface temperature.
6. Evidence shuffle preserves all three cards; selecting all three reports a complete chain.
7. `knowledge-lang` toggles static and canvas labels without resetting slider state.

## Accessibility / resilience

Controls are native range inputs and buttons; readouts use `aria-live`. Canvas is explanatory only, while the text explains the mechanism without requiring pixel interpretation.
