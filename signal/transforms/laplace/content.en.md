---
lang: en
---

::: strings
docTitle: Laplace & the ROC · A Lifetime for Every Frequency · One Interaction per Step
back: ← Knowledge Index
pageTitle: Laplace & the ROC
tagline: The Fourier transform only listens to tones that ring forever — it assumes every frequency keeps singing indefinitely. Real signals decay, or blow up. Laplace asks one extra question: is this tone fading, or growing? That single question turns the transform from a curve into a whole landscape over the s-plane: poles, regions of convergence and stability all become questions of position.
foot: visual.integ.life · Laplace Transform — one interaction per step series
:::

## First question: is it still alive? {#step0 h2=s0t}

::: strings
nav0: 0 Dying waves
:::

Step 0 · The hook {#s0k .step-kicker i18n=text}

This wave is e<sup>σt</sup>·cos(ωt) — a song that changes volume as it sings. σ is its "lifetime parameter": σ < 0 and it fades away; σ = 0 and it sings on forever at constant strength — **that is exactly the Fourier world**, which only handles tones that never die; σ > 0 and it grows until it bursts out of the frame. In the real world, fading and blowing up are the norm. Fourier cannot handle them; Laplace was built for them: **give every frequency ω a partner, σ**. {#s0e .explain}

::: html step0-1
s0sig: σ · decay (−) / growth (+)
s0om: ω · frequency
:::

Park σ exactly at 0 for a second: this undying wave is what the rotating circles on <a class="fourier-link" href="../fourier/#step0">the Fourier page</a> draw. Every real signal dies, yet Fourier pretends they don’t — it gets away with it by imagining periodic repetition. Laplace doesn’t pretend: it writes σ into the transform itself. Next step, watch the plane gain a whole new dimension. {#s0hint .hint}

::: html step0-2
start: Start exploring ↓
:::

::: strings
s0ro: σ = <span>{sig}</span> · ω = <span>{om}</span> · state: <b>{verdict}</b> · envelope e<sup>σt</sup> at t = 6 is {env}
s0vDecay: Decaying — it sings itself out
s0vEqual: Constant amplitude — Fourier’s ideal world
s0vGrow: Growing — it would burst the frame (clamped for display)
cvEnv: ±envelope E(t)
cvWave: e^{σt}·cos(ωt)
:::

## A landscape: every frequency gets a lifetime coordinate {#step1 h2=s1t}

::: strings
nav1: 1 The s-plane
:::

Step 1 · The s-plane {#s1k .step-kicker i18n=text}

Take the textbook signal: x(t) = e<sup>−at</sup>·u(t) (zero for t < 0, exponentially decaying afterwards). Its Laplace transform is X(s) = 1/(s + a), with s = σ + jω. First, read the two axes: **the horizontal axis σ governs lifetime** (further left decays faster; further right grows more easily), **the vertical axis ω governs frequency**. Fix a and paint |X(s)| over the whole s-plane as terrain: **brighter means higher**. One spike punches through the ceiling — the **pole**, standing at s = −a, where the denominator vanishes and the transform diverges. Drag the probe anywhere: X(s) there is computed from the formula point by point, never read off the picture (render resolution is only about painting — see the note under the figure). One small secret: for this signal, |X(s)| is exactly **the reciprocal of the distance to the pole** — the farther from the spike, the flatter the land. {#s1e .explain}

X(s) = 1 / (s + a), s = σ + jω, x(t) = e^{−at}·u(t) {#s1formula .formula i18n=text}

::: html step1-1
s1aLab: a (the pole sits at s = −a; slide and watch the spike move)
:::

Rendering, honestly: the terrain is computed point by point from the closed form log<sub>10</sub>(1+|X(s)|) on a low-resolution offscreen grid, lifted by a γ = 0.6 power (a monotone map — colors change, values don’t) and then upscaled; the color scale saturates at |X| = 99 — the true value at the pole is ∞, so the flat top you see is display clamping. Dark colors far away do not mean zero, either: the values there are simply compressed by the logarithm. Probe readings and all verification use the closed form itself, never interpolation of the render grid. {#s1note .hint}

Compare with the Fourier page: there, each signal owned a single spectrum curve. Here there is no single line — there is **a whole map**: the horizontal axis σ governs lifetime, the vertical axis ω governs frequency. In step 2 you will cut this map with your own hands and watch Fourier fall out of the cut. {#s1hint .hint}

::: strings
s1ro: a = {a} · pole at s = <span>{pole}</span> · probe s = <span>{s}</span> · X(s) = <span>{re}</span> {imSign} j·<span>{im}</span> · |X(s)| = <span>{mod}</span> · distance to pole = {dist} (1/distance = {inv})
cvPole: pole
cvProbe: probe
cvLog: color scale: log₁₀(1+|X(s)|), γ = 0.6 display lift, saturating at 2 (true value at the pole is ∞)
:::

## Fourier is the cut at σ = 0 {#step2 h2=s2t}

::: strings
nav2: 2 The slice
:::

Step 2 · The slice {#s2k .step-kicker i18n=text}

Cut the terrain of step 1 vertically: fix σ = σ<sub>0</sub> and read the values along ω — that is the curve |X(σ<sub>0</sub> + jω)| on the right. Drag the cut to σ<sub>0</sub> = 0, flush against the imaginary axis, and the curve has a name you know: **the Fourier magnitude spectrum** 1/√(a² + ω²), matching to the last digit. But be careful: the cut must land inside the **region of convergence** (the half where σ > −a). Drag a negative and the pole crosses into the right half-plane; the σ = 0 cut then falls outside the ROC — the Fourier spectrum **does not exist**, and this page will not draw you a fake one. Nudge σ<sub>0</sub> a little further right, back inside the ROC, and the Laplace slice is perfectly healthy again. {#s2e .explain}

::: html step2-1
s2aLab: a (pole at s = −a)
s2sLab: σ₀ · cut position
s2btn0: Cut at σ₀ = 0 (the Fourier cut)
:::

That is the whole reason some signals have no Fourier transform but do have a Laplace transform: Fourier is only allowed to stand on the single line σ = 0 — if that line falls outside the ROC, it is blind. Laplace stands on the entire plane; there is always a region it can see from. The sampling page had its own boundary story ("exactly 2f is about phase"); this is the transform version. {#s2hint .hint}

::: strings
s2roIn: a = {a} · σ₀ = <span>{s0}</span> · this cut is inside the ROC (σ₀ > {bd}) ✓ · |X(σ₀ + j0)| = <span>{peak}</span>{fNote}
s2roOut: a = {a} · σ₀ = <span>{s0}</span> · this cut is <b>outside the ROC</b> (need σ₀ > {bd}): the integral diverges and this spectrum line does not exist — it is not that we failed to draw it; it is genuinely not there
s2fNote: " · this is exactly the Fourier magnitude spectrum 1/√(a²+ω²), overlaid point by point with the closed form"
cvRocIn: ROC: σ > −a
cvSlice: cut σ₀
cvMag: |X(σ₀+jω)|
cvOut: ✗ outside the ROC: this spectrum does not exist
cvClip2: peak {peak} — top clipped (readout is exact)
:::

## The same formula, two different signals {#step3 h2=s3t}

::: strings
nav3: 3 One formula, two signals
:::

Step 3 · One formula, two signals {#s3k .step-kicker i18n=text}

The most important act on this page. Signal A: e<sup>−at</sup>·u(t), living on t ≥ 0. Signal B: −e<sup>−at</sup>·u(−t), living on t ≤ 0, with a flipped sign. Compute both Laplace transforms — **the algebra is identical: 1/(s + a)**. The only difference is the region of convergence: A needs σ > −a, B needs σ < −a. Switch signals and watch the shading flip sides; drag the probe anywhere: at one and the same s, the transform converges for A and may diverge for B. The moral, stated plainly: **a transform written without its ROC is an unfinished sentence** — without the ROC you cannot even tell which signal you are talking about. {#s3e .explain}

Both signals have X(s) = 1 / (s + a) — same formula, different ROC {#s3formula .formula i18n=text}

::: html step3-1
s3btnA: Signal A · right-sided e^{−at}·u(t)
s3btnB: Signal B · left-sided −e^{−at}·u(−t)
s3aLab: a (shared; same pole at s = −a)
:::

Why does convergence depend only on σ, never on ω? Because |e<sup>−st</sup>| = e<sup>−σt</sup>: whether the integral converges is decided by whether the real part σ can hold the exponential down; the imaginary part ω only makes it spin in place — it neither helps nor hurts. That is why every ROC is a vertical strip, and why the probe verdict quotes σ alone. If an exam answer draws an ROC in any other shape, it is almost certainly wrong. {#s3hint .hint}

::: strings
s3curA: Signal A (right-sided)
s3curB: Signal B (left-sided)
s3ro: Current signal: <b>{cur}</b> · probe σ = <span>{sig}</span> (ω = {om}) · for signal A (needs σ > {bd}): <b>{va}</b> · for signal B (needs σ < {bd}): <b>{vb}</b>
s3conv: converges ✓
s3div: diverges ✗
cvRoc: ROC (converges)
cvTimeA: x(t): lives on t ≥ 0
cvTimeB: x(t): lives on t ≤ 0
:::

## A system’s character is written in its pole positions {#step4 h2=s4t}

::: strings
nav4: 4 Drag the poles
:::

Step 4 · Drag the poles {#s4k .step-kicker i18n=text}

Now a second-order system H(s) = 1/(s² + 2ζω<sub>0</sub>s + ω<sub>0</sub>²). Its pair of poles can be dragged around the s-plane: above the real axis they form a conjugate pair (the system rings as it decays); drag them back onto the real axis and the poles turn real — they can sit on top of each other (critical damping) or be **pulled apart** into two separate real poles (overdamped). On the right, the impulse response h(t) redraws in real time (closed form, not a numerical simulation) together with its ±envelope: <strong>the real part σ<sub>p</sub> of the poles is the decay rate</strong> — the farther left of the axis, the harder the envelope e<sup>σ<sub>p</sub>t</sup> squeezes it down. Drag them into the right half-plane and watch the envelope open upward instead: the response bursts the frame. {#s4e .explain}

::: html step4-1
s4p1: Stable ringing decay
s4p2: Critically damped
s4p3: Overdamped
s4p4: Sustained oscillation
s4p5: Blow-up
s4tLab: envelope probe time t
:::

Conventions: underdamped, h(t) = e<sup>σ<sub>p</sub>t</sup>·sin(ω<sub>d</sub>t)/ω<sub>d</sub> with envelope E(t) = e<sup>σ<sub>p</sub>t</sup>/ω<sub>d</sub>; critically damped, h(t) = t·e<sup>pt</sup> and the curve is its own envelope; overdamped with real poles p<sub>1</sub>, p<sub>2</sub>, h(t) = (e<sup>p<sub>1</sub>t</sup> − e<sup>p<sub>2</sub>t</sup>)/(p<sub>1</sub> − p<sub>2</sub>) and the envelope is the sum of the absolute components, (e<sup>p<sub>1</sub>t</sup> + e<sup>p<sub>2</sub>t</sup>)/|p<sub>1</sub> − p<sub>2</sub>|. Everything is closed form; every point can be recomputed by hand. {#s4note .hint}

One more word on the “—” in the readout: when the two real poles have **opposite signs**, ω₀ = √(p₁p₂) is imaginary and ζ is undefined — the “—” is the honest answer, not a missing computation; a pole sitting exactly at the origin gives ω₀ = 0 and is likewise undefined. When you see “—”, read the pole positions and the verdict instead: any pole in the right half-plane means the system is unstable. {#s4dash .hint}

::: html step4-2
s4linkTxt: Everything the PID controller does on the control page is one long fight to push the closed-loop poles into the left half-plane: the deeper they go, the steadier the cart and the faster it settles — go push them yourself over there →
s4lkC: Feedback & Control →
:::

Get the feel of it: park the poles just left of the axis (σ<sub>p</sub> ≈ −0.1) and watch the tail ring on and on; then yank them to σ<sub>p</sub> = −2.5 and the tail is cut off at once. The smaller ζ is, the floatier the ringing; at ζ ≥ 1 it cannot ring at all — click through the five presets; it teaches faster than definitions. {#s4hint .hint}

::: strings
s4ro: poles: <span>{poles}</span> · ζ = <span>{zeta}</span> · ω₀ = <span>{w0}</span> · state: <b>{verdict}</b> · envelope at t = {te}: ±E = <span>{env}</span> (definition of E in the note under the figure)
s4vStable: stable — the response decays to zero
s4vMarginal: bounded free response without asymptotic decay (oscillation or a nonzero constant); this causal transfer function is not BIBO input-output stable
s4vUnstable: unstable — the response blows up (frame clamped)
cvImp: impulse response h(t)
cvDrag: drag me
:::

## Given an ROC, call causality and survival {#step5 h2=s5t}

::: strings
nav5: 5 The reading desk
:::

Step 5 · The reading desk {#s5k .step-kicker i18n=text}

Final exercise: reading a system. Given an H(s) and one ROC (the poles cut the plane into three vertical strips — pick one), settle three things on the spot: whether h(t) is a **right-sided, two-sided or left-sided** signal; whether the system is **causal**; whether it is **stable**. There are only two rules, and they are worth memorizing: **causal ⟺ the ROC lies to the right of the rightmost pole** (every component is then a right-sided signal); **stable ⟺ the ROC contains the imaginary axis σ = 0**. Switch to the second system, whose poles straddle into the right half-plane: if you want stability you must pick the strip containing the axis — and that strip is never the causal one. You cannot have both; the ROC decides. {#s5e .explain}

::: html step5-1
s5sysLab: System H(s)
s5sys1: H₁: poles −1, −2
s5sys2: H₂: poles +1, −2
s5rocLab: Pick an ROC
s5rocR: Right strip (right of the rightmost pole)
s5rocM: Middle strip (between the poles)
s5rocL: Left strip (left of the leftmost pole)
s5quizBtn: Deal me a random question
s5qStable: Stable
s5qUnstable: Unstable
:::

This desk uses everything from the first four steps: pole positions (step 1), the axis as a line that matters (step 2), the ROC choosing the signal (step 3), left versus right half-plane deciding survival (step 4). In the real world, choosing an ROC is not an exam question — causality is a hard physical constraint, so real systems always take the rightmost strip, and the stability question becomes simply “are all the poles in the left half-plane?” {#s5hint .hint}

::: strings
s5rocRs: right strip
s5rocMs: middle strip
s5rocLs: left strip
s5ro: ROC: <span>{roc}</span> · h(t) is: <b>{form}</b> · causal: <b>{causal}</b> · stable: <b>{stable}</b>
s5formR: right-sided (zero for t < 0)
s5formT: two-sided (lives on both sides)
s5formL: left-sided (zero for t > 0)
s5yes: yes
s5no: no
s5why: Reasoning: {why}
s5whyCausal: the ROC is right of the rightmost pole, so every pole component is a right-sided signal and their sum is right-sided too → causal
s5whyNotCausal: the ROC is not the rightmost strip, so at least one component is a left-sided signal → h(t) ≠ 0 for t < 0 → not causal
s5whyStable: the ROC contains the axis σ = 0, so h(t) is absolutely integrable → stable
s5whyNotStable: the ROC does not contain the axis σ = 0 → unstable
s5quizQ: Question: {sys}, with the {roc} ROC. Is this system **stable**? Answer first, then read the verdict.
s5qRight: "✓ Correct. "
s5qWrong: "✗ Not quite — see the verdict for the right answer. "
cvHt: h(t) shape (closed form)
cvClip5: beyond the ±2.5 frame — clipped (verdicts stand)
:::

## Family portrait: half of Signals & Systems on one plane {#step6 h2=s6t}

::: strings
nav6: 6 Finale · Family portrait
:::

Step 6 · Finale {#s6k .step-kicker i18n=text}

Step back and see the whole map. Living on this one s-plane are all the pages of your catch-up line: the **imaginary axis jω** is Fourier’s home — it only ever moves along that line; the **left half-plane** is where stable systems live, and the control page’s entire war is about shoving poles into that territory; the sampling page made signals copy themselves across the frequency axis, and the stage for those copies is still this plane. One more move: **roll the plane up**. The map z = e<sup>sT</sup> wraps the whole left half-plane into the inside of a circle — and that circle is the hero of the next page: the unit circle of the Z-transform. {#s6e .explain}

::: html step6-1
:::

In the animation, a point sweeps along the line σ = −0.5 just left of the axis, with sampling period T = 0.5; its image in the z-plane stays on the circle of radius |z| = e<sup>σT</sup> = e<sup>−0.25</sup> ≈ 0.779 (the orange dashed circle) — a number you can verify against the picture yourself. Left half-plane ↔ inside of the unit circle: that single correspondence is the entire intuition behind Z-transform stability (preview only — no verdicts here). {#s6zNote .hint}

::: html step6-2
s6fin: To wrap up: what Laplace really does is hand Fourier **one extra dimension**. A spectrum grows from a line into a landscape; poles are its peaks, the ROC its borders, the imaginary axis Fourier’s old home. Next time any textbook shows you the s-plane, picture this map first: every system lives at an address on it, and its character is written on the doorplate.
s6linksLab: Back to the earlier pages:
s6lkF: Fourier transform: circles & waves →
s6lkC: Feedback & control: pushing poles →
s6lkS: Sampling & aliasing: copies in frequency →
:::

::: strings
cvAxis: the axis jω — Fourier lives on this line
cvLHP: left half-plane — home of stability (the control page’s battlefield)
cvZ: z-plane: rolled up
cvUnit: unit circle
:::
