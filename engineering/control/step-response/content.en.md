---
lang: en
---

::: strings
pageTitle: Step Response · Damping Sets the Overshoot, Natural Frequency Sets the Speed
back: ← Knowledge index
navLabel: Step response steps
tagline: Ask a system with inertia, a restoring spring and damping to jump to a new target, and it cannot teleport: it either shoots past and swings back, or creeps up slowly. Two numbers — the damping ratio ζ and the natural frequency ωn — describe the whole shape.
nav0: 0 The step
nav1: 1 Damping ratio ζ
nav2: 2 Overshoot & peak
nav3: 3 Natural frequency ωn
nav4: 4 Poles
nav5: 5 Design challenge
nav6: 6 Wrap-up
foot: visual.integ.life · Step Response
na: n/a
notSettled: not settled within this run
seconds: " s"
:::

## The target jumps — how does the output follow? {#step0 h2=s0t}

Step 0 · See it first {#s0k .step-kicker i18n=text}

This step asks: when a mass on a spring with damping is told to move to a new position **all at once**, what path does it take? An instant change of target is a **step input**: the target u jumps from 0 to 1 at t = 0 and stays there (orange dashed line). The output y plotted over time is the **step response** (cyan line). Where it finally rests, 1, is the **steady-state value**. Press the button and watch the slider block on top (the output position) move together with the curve below. {#s0e .explain}

::: html step0-1
scrub: Drag to inspect any moment t
applyStep: Apply the step
pause: Pause
:::

Horizontal axis: time in seconds; vertical axis: output y; orange dashed line: the step target. This step fixes ζ = 0.3 and ωn = 2 rad/s; the next steps let you change them. Playback is teaching slow motion: 10 s of model time plays in 4 s; pause at any moment or drag the time slider to inspect each instant. {#s0hint .hint i18n=text}

::: strings
replay: Replay
resume: Resume
s0progress: Simulated time t = {t} s / {T} s · output y = {y}
s0done: Done: the output first reaches {peak} ({po}% above the steady-state value 1), swings a few times, then rests near 1.
:::

## Damping ratio ζ: overshoot or creep {#step1 h2=s1t}

Step 1 · The first knob {#s1k .step-kicker i18n=text}

This step asks: how does the shape change with more or less damping? **Damping** is the force proportional to velocity that drains motion energy (<a class="xlink" href="../../../physics/waves/resonance/#step1">→ Resonance, step 1: how damping removes energy</a>). The **damping ratio ζ** (zeta) turns it into a unitless number: actual damping divided by the damping that just stops the back-and-forth swing. ζ &lt; 1 is **underdamped** (passes the target, swings back); ζ = 1 is **critically damped**; ζ &gt; 1 is **overdamped** (never passes, but slow). {#s1e .explain}

::: html step1-1
zeta: Damping ratio ζ
clearTrails: Clear old curves
:::

What to do: keep ωn = 2 fixed and move only ζ. Each time you let go, the previous curve fades and stays for comparison. Drag from 0.1 to 1, then to 2, and watch the first spike above 1 disappear. Readout terms: overshoot = how far the peak rises above the steady-state value 1, in percent; 2% settling time = time to enter and stay within 1 ± 2% (steps 2 and 3 explain both). {#s1hint .hint i18n=text}

::: strings
s1readout: ζ = {z} · {regime} · overshoot {po}% · 2% settling time {ts}
regime_under: underdamped: passes 1, then swings
regime_critical: critically damped: fastest without passing 1 (for fixed ωn)
regime_over: overdamped: never passes 1, but slow
:::

## Overshoot depends on ζ alone, not on speed {#step2 h2=s2t}

Step 2 · Read the first metric {#s2k .step-kicker i18n=text}

This step asks: what decides how far past the target it goes? **Overshoot** is how far the highest point rises above the steady-state value 1, as a percentage of that value; smaller is calmer. **Peak time tp** is the time from the step to that highest point. For an ideal underdamped second-order system (0 &lt; ζ &lt; 1) the textbook result is **overshoot = e^(−ζπ/√(1−ζ²)) × 100%**, and only ζ (the damping ratio: actual damping ÷ the damping that just stops the swing) appears in it — not ωn (the natural frequency, which sets how fast the whole curve plays out; step 3). The right chart plots that formula; the dot is the overshoot measured on the current curve. {#s2e .explain}

::: html step2-1
poAxis: overshoot %
wn: Natural frequency ωn (rad/s)
:::

What to do: first move only ζ and watch the dot travel along the right-hand curve. Then hold ζ and move only ωn — the spike on the left slides sideways, but its height and the dot stay put. {#s2hint .hint i18n=text}

::: strings
s2readout: Overshoot: measured on curve {po}% · formula {poF}%　|　Peak time tp: measured {tp} · formula π/ωd = {tpF}
zetaAxis: ζ
:::

## Natural frequency ωn: the same shape, squeezed or stretched in time {#step3 h2=s3t}

Step 3 · The second knob {#s3k .step-kicker i18n=text}

This step asks: how do you make the system faster without changing how far it overshoots? The **natural frequency ωn** is the angular frequency at which the system would swing on its own with no damping (rad/s); a stiffer spring or a lighter mass raises it. The **2% settling time ts** is the time it takes the output to enter the band 1 ± 0.02 and *stay* there; smaller is faster. With ζ fixed, doubling ωn squeezes the whole curve to half its length in time: the same overshoot (how far the peak rises above the steady-state value), half the peak time and settling time. A common estimate is ts ≈ 4/(ζωn): the time for the envelope e^(−ζωn·t) to shrink to about 2% (e^(−4) ≈ 1.8%). {#s3e .explain}

::: html step3-1
:::

What to do: keep ζ fixed and drag ωn from 1 to 4; previous curves stay on the chart. The pale green band is 1 ± 2%; each vertical tick marks when that curve enters the band for good. The estimate only tracks how fast the envelope decays (it drops the envelope’s leading factor and ignores exactly when the swing falls inside the band), so the measured time can be shorter or longer: for 0.1 ≤ ζ ≤ 0.95 the measured time is about 0.70–1.25 times the estimate (shortest near ζ ≈ 0.78). {#s3hint .hint i18n=text}

::: strings
s3readout: ωn = {w} rad/s · 2% settling time: measured {ts} · estimate 4/(ζωn) = {tsF} · overshoot {po}%
:::

## Two knobs are really one point in the complex plane {#step4 h2=s4t}

Step 4 · A different picture {#s4k .step-kicker i18n=text}

This step asks: can ζ (the damping ratio, which sets the overshoot) and ωn (the natural frequency, which sets the speed) be drawn on one chart? The system’s **poles** are the two values of s that make s² + 2ζωn·s + ωn² equal zero, plotted in the complex plane (real part across, imaginary part up; <a class="xlink" href="../../../signal/transforms/laplace/#step4">→ Laplace, step 4: a system’s character is written in its pole positions</a>). When underdamped they are the pair −ζωn ± j·ωd, with ωd = ωn√(1−ζ²). How to read them: the **farther from the imaginary axis** (larger ζωn), the faster the swing dies out; the **higher** (larger ωd), the faster it swings; the **angle θ from the negative real axis** satisfies cos θ = ζ, so a smaller angle means less overshoot. {#s4e .explain}

::: html step4-1
:::

What to do: move only ζ first — the poles slide along a circle of radius ωn around the origin. Then move only ωn — they slide along a ray through the origin. The dashed lines on the right are the envelope 1 ± e^(−ζωn·t)/√(1−ζ²); the swing always stays inside it. {#s4hint .hint i18n=text}

::: strings
s4readout: poles = {re} ± {im}j · distance from origin ωn = {w} · cos θ = ζ = {z} · decay rate ζωn = {sig} /s
s4readoutReal: poles = {p1}, {p2} (both on the real axis: no swing) · ζ = {z}
reAxis: Re
imAxis: Im
:::

## Design challenge: overshoot ≤ 10%, 2% settling time ≤ 2 s {#step5 h2=s5t}

Step 5 · Put it to work {#s5k .step-kicker i18n=text}

This step asks: given a specification, how do you work back to the damping ratio ζ and the natural frequency ωn? The requirement: **overshoot** (how far the peak rises above the steady-state value, in percent) at most 10%, and **2% settling time** (time to enter and stay within 1 ± 2%) at most 2 s. The dashed lines on the left are the two limits; the right chart is the complex plane, where the green region holds the pole positions that meet both *according to the formulas*: angle θ ≤ 53.8° (ζ ≥ 0.59, the ζ for 10% overshoot) and at least 2 away from the imaginary axis (ζωn ≥ 2, so 4/(ζωn) ≤ 2 s). Estimate and measurement differ slightly, so pass/fail is judged from the values measured on the simulated curve. {#s5e .explain}

::: html step5-1
quizPrompt: A system overshoots by 30%. You want it under 5% without slowing it down much. What do you change first?
quizA: Raise ωn: a faster system overshoots less.
quizB: Raise ζ: overshoot depends on ζ alone; then use ωn to win back the speed.
quizC: Neither — just add a filter.
check: Check
:::

::: strings
s5readout: overshoot {po}% (need ≤ 10%) {poOk} · 2% settling time {ts} (need ≤ 2 s) {tsOk}
pass: ✓
fail: ✗
allPass: Both met. This is one solution among many.
correct: Right: only ζ appears in the overshoot formula. Set the shape with ζ, then the time scale with ωn.
wrong: Look at the right chart in step 2 again: did the overshoot dot move when you dragged ωn?
:::

## One shape parameter, one time parameter {#step6 h2=s6t}

Wrap-up {#s6k .step-kicker i18n=text}

::: html step6-1
s6fin: ζ sets the **shape** of the curve: how far it overshoots and how many times it swings. ωn sets the **time scale**: the same shape, squeezed or stretched. In the complex plane they are the pole angle and its distance from the origin.
formula: y″ + 2ζωn·y′ + ωn²·y = ωn²·u　　overshoot = e^(−ζπ/√(1−ζ²))　　ts ≈ 4/(ζωn)
boundary: Model limits: this is an ideal second-order system — no zeros, no saturation, no delay — integrated with RK4 at a 0.005 s step. The formulas hold only for 0 < ζ < 1, and the settling-time formula is an estimate. Real closed loops (for example a plant under PID control) are often not purely second-order, so trust the measured curve over the formula.
lk1: ↗ Feedback control, step 3: how the D term brakes early and cuts overshoot
lk2: ↗ Resonance, step 1: how damping removes energy
lk3: ↗ Laplace, step 4: pole positions and stability
:::
