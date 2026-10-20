# reaction-rates build report

Built the six-step bilingual page in `reaction-rates/` with the shared dark step skeleton and a deterministic 2D A/B particle collision simulation.

## Steps

- Step 0 shows low-energy and successful A/B collision flashes and counts both from the simulation window.
- Step 1 changes particle count and reports successful collisions per second plus cumulative products.
- Step 2 changes temperature, which changes particle speed and the share clearing the threshold; its comparison uses the same 50% intensity change as the concentration comparison.
- Step 3 keeps solid amount fixed and switches the contactable B-particle list between chunk and powder.
- Step 4 changes the activation threshold (catalyst toggle is a threshold preset) and reports readiness, rate, and unchanged mean speed.
- Step 5 states the four-factor intuition, links to `chemical-equilibrium/#step0` and `particles-states/#step1`, and states the model mismatch honestly.

## Pure functions and constants

`REACTION_RATES` exposes `seeded`, `makeParticles`, `initialState`, `advanceState`, `metricWindow`, `simulateWindow`, `statsFor`, `relativeSpeed`, and `ratio`. Readouts and the canvas are derived from the same state. Constants are centralized in `CONST`: `W=900`, `H=300`, collision radius `R=6`, `DT=1/30`, `WINDOW=8`, and `MAX_PARTICLES=96` (below the required 200 cap). The speed scale is `0.25 + 0.8 × temperature/100`; the simplified threshold is compared with relative speed as `threshold/40`. The block contactable fraction is `0.34`; powder is `1.0`.

## Self-checks

- `node --check reaction-rates/app.js` — PASS.
- `node --check reaction-rates/i18n.js` — PASS.
- `node reaction-rates/probe.js` — PASS, 4 assertions: concentration increase, temperature increase larger than same-size concentration increase, lower threshold increase with unchanged mean speed, particle cap.
- Node VM key parity probe — PASS, 72 zh/en keys exactly matched.
- CSS review at 390px — PASS: no fixed content width; `.step-inner` is `width:100%`, canvas is `width:100%`, controls wrap, and buttons allow text wrapping. The only fixed canvas backing dimensions are internal drawing coordinates and are scaled to the CSS width by `fitCanvas`.

## Ambiguity resolved

The brief allows a threshold slider or catalyst switch. This build keeps the threshold slider for inspectable model state and adds a catalyst button that toggles the threshold between 60 and 35. The comparison text uses a deterministic 50% increase (32→48 particles versus temperature 100→150) so the “temperature effect is steeper” claim is computed from the same seeded engine rather than asserted by a decorative curve.
