# Thermodynamics lesson spec

## Contract

The lesson must expose a complete causal chain rather than isolated formulas: change a state variable, observe pressure, choose a path, audit the first law, compare isothermal and adiabatic processes, then transfer the same ledger to a heat engine.

## Required interactions

1. `n`, `T`, and `V` sliders update a textual state readout and piston drawing using `P=nRT/V`.
2. Process selector and `Vf`/`γ` controls update a P–V curve, shaded work area, `Q`, `ΔU`, and `W` readouts.
3. A side-by-side path drawing starts from the same initial point and makes the different endpoint temperatures visible.
4. Heat-engine controls update `Qin`, `Qout`, `Wnet`, actual efficiency, and Carnot ceiling.
5. At least three misconception prompts return corrective feedback grounded in the current equation.
6. Chinese and English copy have equal keys; canvas figures have text equivalents.

## Acceptance checks

- `node thermodynamics/tests/core.cjs` passes.
- No NaN/Infinity appears for slider ranges.
- First-law residual remains below `1e-9 kJ` in the model.
