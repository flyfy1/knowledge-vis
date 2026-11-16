---
lang: en
---

::: strings
pageTitle: Resonance · Push in Time and a Small Force Goes a Long Way
tagline: Start from a spring's natural beat, see how damping makes oscillations die away, then find the driving frequency at which periodic pushes build the largest swing.
:::

## With nobody pushing, a mass on a spring has its own beat {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Natural frequency
:::

::: html step0-1
:::

This step answers: for a mass swinging freely on a spring, what decides how many swings per second? Pull it 1 unit and let go: simple harmonic motion with **natural angular frequency** ω₀ = √(k/m) (k is the spring stiffness, larger means stiffer; m is the mass) and period T = 2π/ω₀. Press play and the trace x(t) is drawn on the right; the "measured period" is the gap between two successive upward zero crossings of the trace, to compare with the formula. {#s0e .explain}

::: html step0-2
s0o: Raise k: it swings faster; raise m: slower. Play one or two periods and check that the measured period equals 2π√(m/k).
lK: Spring stiffness k
lM: Mass m
bPlay: Play / Pause
bReset: Reset: clear the trace and go back to the start
:::

::: strings
r0: ω₀ = √(k/m) = {w0}; formula period T = {tp}; period measured from the trace = {tm}; t = {t}.
none: not a full period yet
hint: Press Play to start
:::

## Damping: energy leaks away bit by bit {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Damping
:::

::: html step1-1
:::

This step answers: how does the motion change once friction (damping) is added? The **damping ratio** ζ measures the damping: ζ = 0 none; ζ < 1 underdamped, the amplitude decays inside an envelope e^(−ζω₀t) (dashed); ζ = 1 critical damping, the fastest return to rest without overshooting; ζ > 1 overdamped, a slow creep back. This page uses ω₀ = 2 (same in later steps). "Successive peak ratio" in the readout is the ratio of two neighbouring peak heights on the curve. {#s1e .explain}

::: html step1-2
s1o: Slowly raise ζ from 0 to 1.6: the envelope goes from no decay, to faster and faster decay, to no oscillation at all; compare the measured peak ratio with e^(−2πζ/√(1−ζ²)).
lZ: Damping ratio ζ
:::

::: strings
r1: ζ = {z}: {kind}; successive peak ratio: measured {rm}, formula {rf}.
kUnder: underdamped (oscillates while decaying)
kCrit: critically damped (no oscillation, fastest return)
kOver: overdamped (no oscillation, slow return)
kNone: undamped (never decays)
:::

## Push it periodically: how the swing grows {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Driven oscillator
:::

::: html step2-1
:::

This step answers: what happens when a damped oscillator is pushed by a periodic force F cos Ωt? The equation is x″ + 2ζω₀x′ + ω₀²x = F cos Ωt (F = 1, ω₀ = 2). The first few cycles are a "transient"; then it settles into a **steady state** oscillating at the driving frequency Ω with fixed amplitude A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²). Press play: orange is x(t), the dashed cyan line is the push (scaled). The "measured amplitude" is the largest displacement over the last two driving cycles. {#s2e .explain}

::: html step2-2
s2o: Set Ω/ω₀ = 0.5 and play, noting the steady amplitude; then set 1 (pushing at the natural frequency) and replay: how large does it get? Then try 1.6.
lR: Driving frequency ratio Ω/ω₀
:::

::: strings
r2: Ω = {W} (Ω/ω₀ = {r}), ζ = {z}; formula steady amplitude A = {A}; measured max displacement over the last two driving cycles = {Am}; t = {t}.
:::

## The resonance curve: only near one frequency does the swing get large {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Resonance curve
:::

::: html step3-1
:::

This step answers: sweeping the driving frequency, how does the steady amplitude change? The horizontal axis is Ω/ω₀ and the vertical axis is the steady amplitude A. The peak sits at Ω ≈ ω₀√(1−2ζ²) (essentially ω₀ for light damping) and its height is about F/(2ζω₀²). The quality factor Q = 1/(2ζ): the lighter the damping, the taller and narrower the peak, with half-width about ω₀/Q. The current ζ is orange; grey reference curves are ζ = 0.05, 0.15 and 0.5. {#s3e .explain}

::: html step3-2
s3o: Lower ζ from 0.5 to 0.05: the peak gets taller and narrower; move Ω/ω₀ and watch the dot travel along the curve to the top, then check the peak position and height in the readout.
:::

::: strings
r3: Ω/ω₀ = {r}, A = {A}; peak at Ω/ω₀ = {pk}, peak height = {ph}; Q = 1/(2ζ) = {Q}, half-width about {bw} (in Ω/ω₀ units).
:::

## Phase: the response always arrives a little late {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Phase lag
:::

::: html step4-1
:::

This step answers: do the displacement and the push reach their maxima together? In steady state the displacement lags the push by a phase φ = atan2(2ζω₀Ω, ω₀²−Ω²): at very low Ω, φ ≈ 0 (it follows the push), at Ω = ω₀, φ = 90°, and at very high Ω, φ ≈ 180° (it moves against the push). Cyan is the push, orange the displacement; the horizontal axis is time (about 3 driving cycles). {#s4e .explain}

::: html step4-2
s4o: Sweep Ω/ω₀ from 0.2 to 2: the orange wave goes from in step, to a quarter cycle behind, to opposite; change ζ and see whether the phase changes quickly or slowly near resonance.
:::

::: strings
r4: Ω/ω₀ = {r}, ζ = {z}: φ = {phi}°, a lag of {frac} cycle.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) natural frequency ω₀ = √(k/m); (2) damping ratio ζ sets the decay, ζ = 1 is critical; (3) in steady state a periodic push makes it oscillate at Ω with A = F/√((ω₀²−Ω²)² + (2ζω₀Ω)²); (4) the amplitude peaks when Ω is near ω₀, taller and narrower for lighter damping (Q = 1/2ζ); (5) the response lags the push by a phase from 0° to 180°, 90° at resonance. {#s5e .explain}

::: html step5-2
qq: Pushing at the resonance frequency, you halve the damping ratio ζ. About how much does the steady amplitude change?
qo0: It roughly halves
qo1: No change
qo2: It roughly doubles
s5m: This page models a linear single-degree-of-freedom oscillator: spring force proportional to displacement, damping force proportional to velocity, and a single-frequency cosine push. Real structures have several natural frequencies and nonlinearity (springs stop being linear at large amplitude), and resonance can break them; with heavier damping the peak shifts away from ω₀; the animation is a teaching slow-motion.
lk0: Standing waves: resonance on a string, where the push hits a harmonic step
lk1: Frequency response: the same frequency-picking behaviour, applied to a linear system's input and output
lk2: Interference: compare the reinforcement condition for two superposed waves
:::

::: strings
qwhy: The resonance peak is about F/(2ζω₀²), inversely proportional to ζ, so halving ζ doubles it (check in step 3).
:::
