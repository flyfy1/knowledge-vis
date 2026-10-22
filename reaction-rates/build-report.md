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

## Fix pass (independent review)

Fixes for the reaction-rates MUST-FIX items in `claude-reviews/pair3.md`. Changes are in `app.js` (engine and page wiring), `index.html` (per-step run buttons, s1 trace canvas, s4 slider range 30–100 with default 90) and `i18n.js` (81/81 zh/en keys).

- **M1 hidden global Run:** removed the single `running` flag. Every step has its own Run/Pause button (`s0-run`…`s4-run`). Each sim auto-runs while its canvas is on screen (IntersectionObserver, threshold 0.15) and stops off-screen. With `prefers-reduced-motion`, steps start paused.
- **M2 double counting:** contacts are tracked by stable particle ids (`state.contacts`). A collision is counted only on the frame contact *starts*: one encounter counts once, however long it lasts. Collision frequency now rises with temperature (20-seed means: 1.58 → 1.99 → 2.29 → 2.65 → 3.11 → 3.66 /s for T = 60…180).
- **M3 cherry-picked step 2 comparison:** the comparison now uses the live threshold, with no seed or threshold override. It is a mean of 6 seeds × 20 s each (`longRunStats`). The text spells out the mapping: particles 32→48 (A and B each +50%) vs relative temperature 100%→150% (mean speed ×1.38, computed). It also shows collision-frequency change, success-share change and a computed verdict. At the old threshold 60 the success share was 64%, and heating was *not* steeper (+88% vs +126%). The base threshold is therefore now 90: the success share is 18%, in the tail of the speed distribution. Under that condition s2e says heating is steeper: +306% vs +140%, and 30/30 single seeds agree. The catalyst preset is now 90→60. Step 0 keeps threshold 60, and its readout prints it.
- **M4 fictional products:** a success now consumes that A and B. It creates a green ◆ P particle at the meeting point, which fades and leaves after 4 s (the count is kept). Fresh A/B with the same speeds are fed in at random spots, and solid sites are refilled in place. modelBody discloses this replenishment ("continuously fed reactor"), says the rate therefore never slows, and says that in a closed vessel it would. The odd success kick (S6) is gone.
- **M5 missing product curve:** new `s1-trace` canvas plots cumulative products over the last 20 s, drawn from `state.history`. When the slider moves, the previous run stays as a dashed trace for comparison.
- **M6 surface area:** step 3 is now a real solid of 36 fixed B lattice sites: one 6×6 chunk or nine 2×2 grains. The pure function `exposedSites` marks contactable sites, those with an empty 4-neighbour. They are drawn bright orange with an outline; buried sites are dark brown; the dashed box is the contact zone. A particles bounce off the solid and cannot reach buried sites (0 violations in the probe). The readout and comparison counts come from state: 20/36 vs 36/36. Stationary B means relative speed = A's speed, so this step uses its own threshold 40, disclosed in s3e/s3ro.
- **M7 anisotropic scaling:** `fitCanvas` now uses one uniform scale with CSS height = width/3 (the trace uses 900×200). Text, marker and particle sizes are compensated for the scale, so they stay legible at 390 px. The legend wraps onto separate lines when narrow.
- **M8 reset all:** `*-reset` calls `resetStep(k)`, which rebuilds only that step's sim from its current control values (slider, surface choice).
- **M9 per-frame recompute:** comparison values are computed once per setting, off the frame loop (`setTimeout`), and cached by key. Off-screen sims don't advance, and canvases resize only when the width changes. Headless Chromium measured a median frame interval of 8.3 ms.
- **M10 one-frame flashes:** ✓/✗ markers live in `state.marks` for 0.5 s with fading alpha.
- SHOULD-FIX done: S2 (the "above threshold" readout is now "success share (last 8 s)", computed from the window), S3 (relative temperature is described as a speed knob, not kelvin), S4 (the catalyst button toggles exactly between 90 and 60, and its label follows), S6 (removed). Skipped: S1 (badges/pages.config), S5 (unused keys).
- Rates covering under 1 s of simulated time are shown as "—" rather than a noisy number.
- Self-checks: `node --check` app.js and i18n.js pass; 81/81 zh/en key parity. Engine probe: 19/19 pass. It covers encounter counting (×1.000 on 10 seeds), monotone frequency vs T, temp > conc at the live threshold on 30/30 seeds, P creation and consumption on 10 seeds, the 20 s history, surface counts and no buried contact over 10 seeds, powder > block on 20/20 seeds, the 0.5 s marker life, catalyst speed identical on 10/10, and doubling particles on 30/30. Headless-Chromium DOM probe: 17/17 pass. It covers 3:1 uniform canvas scale at 1280 and 390 px, auto-run on arrival, per-step pause, a reset that is isolated and keeps sliders in sync, trace pixels, surface readout = state, the frame budget, the compare text, the language switch, and zero console errors.
