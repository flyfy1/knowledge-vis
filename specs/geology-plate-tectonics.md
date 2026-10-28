# Geology slice: plate tectonics

## Why this slice
Earth & Space had no causal, manipulable lesson connecting boundary motion to observable evidence. This page fills that gap with one visual mechanism and four short steps.

## Acceptance checks
1. `/geology-plate-tectonics/` loads without external dependencies beyond the existing lesson shell.
2. Every step has one primary interaction and a visible readout.
3. Boundary state changes both canvas arrows and the boundary explanation.
4. Speed/heat changes derived metrics; speed 0 remains a valid state.
5. Evidence shuffle preserves all three boundary kinds; checking three selected cards reports success.
6. `knowledge-lang` toggles all static strings and does not reset slider state.

## Accessibility / resilience
Controls are native buttons and range inputs; readouts use text and `aria-live` for the final check. Canvas is explanatory only, so the causal text remains available without pixel interpretation.
