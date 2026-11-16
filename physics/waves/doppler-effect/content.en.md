---
lang: en
---

::: strings
pageTitle: The Doppler Effect · Higher as It Approaches, Lower as It Leaves
tagline: A sound source moves, and its wavefronts bunch up or stretch out; from the wavefront spacing work out the heard frequency, then the pitch curve of a pass-by and the Mach cone.
:::

## A still source: wavefronts spread out evenly {#step0 h2=s0t pre=1}

::: strings
nav0: 0 A still source
:::

::: html step0-1
:::

This step answers: what do the wavefronts of a still source look like? The source emits a wavefront (a ring) every 1/f seconds, and each ring expands at the wave speed c (this page uses c = 1, teaching units). The gap between neighbouring rings is the **wavelength** λ = c/f. Press play and watch the rings pile up one after another. {#s0e .explain}

::: html step0-2
s0o: Drag f: a larger f makes the rings denser with a smaller gap; compare the λ in the readout with the gap you see.
lF: Emission frequency f (per second)
bPlay: Play / Pause
bReset: Reset: clear the wavefronts and go back to the start
:::

::: strings
hint: Press Play to start
r0: f = {f}: wavelength λ = c/f = {lam}; a ring is emitted every {T} s; {n} wavefronts emitted so far.
:::

## A moving source: wavefronts bunch up ahead and stretch out behind {#step1 h2=s1t pre=1}

::: strings
nav1: 1 A moving source
:::

::: html step1-1
:::

This step answers: when the source moves, what frequencies do listeners ahead and behind hear? The source moves right at speed v, and each ring is centred where the source was when it emitted it, so the rings are no longer concentric. The picture is drawn in the source's frame (source at the centre). For distant listeners at rest in the air: ahead, the ring gap shrinks to λ_ahead = (c − v)/f and they hear f_ahead = f·c/(c − v); behind, λ_behind = (c + v)/f and they hear f_behind = f·c/(c + v). {#s1e .explain}

::: html step1-2
s1o: Raise v/c from 0 to 0.9: the rings crowd together on the right (ahead) and spread out on the left (behind); check the two frequencies in the readout, with f_ahead > f > f_behind.
lM: Source speed ratio v/c
:::

::: strings
r1: v/c = {m}: ahead the ring gap is λ_ahead = {lf}, heard f_ahead = {ff}; behind λ_behind = {lb}, heard f_behind = {fb} (source frequency f = {f0}).
:::

## Not straight ahead or behind? Only the component toward the listener counts {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Any direction
:::

::: html step2-1
:::

This step answers: for a listener in any direction θ (measured from the source's direction of motion), what frequency is heard? Only the part of the source velocity toward the listener, v cosθ, squeezes or stretches the wavefronts: f′ = f/(1 − (v/c) cosθ). θ = 0° is straight ahead (highest), θ = 180° straight behind (lowest), and at θ = 90° there is no component toward the listener so f′ = f. The curve at the lower right shows f′ against θ, and the dot is the current listener. θ is the direction from the source to the listener at the moment of emission. {#s2e .explain}

::: html step2-2
s2o: Turn θ from 0° to 180°: the listener dot moves round the circle and the point on the curve falls from highest to lowest; near 90° confirm f′ ≈ f; then change v/c and see the curve's swing grow.
lA: Listener direction θ
:::

::: strings
r2: v/c = {m}, θ = {a}°: f′ = f/(1 − (v/c)cosθ) = {fp} (source frequency f = 1); {dir} compared with the source.
dirHigh: higher
dirLow: lower
dirSame: the same
:::

## A vehicle passes by: the pitch drops from high to low {#step3 h2=s3t pre=1}

::: strings
nav3: 3 A pass-by
:::

::: html step3-1
:::

This step answers: how does the pitch heard by someone beside a road change with time as a vehicle passes? The vehicle drives in a straight line at v, and the listener stands a distance b from the path. At each moment the listener hears sound emitted earlier, with frequency f′ = f/(1 − (v/c)cosθ), where θ is the vehicle's direction relative to the listener at emission (the emission time is found by bisection). The curve on the right builds up what the listener hears over time; larger b gives a gentler transition, and a very small b is almost a jump. f = 1. {#s3e .explain}

::: html step3-2
s3o: Press play and watch the curve drop from a plateau above 1 to one below 1; reduce b to 0.3 and replay for a steeper transition; raise v/c to push the two plateaus farther from 1.
lB: Listener distance b from the path
bPass: Play / Pause: vehicle passes by
:::

::: strings
r3: v/c = {m}, b = {b}: approach limit {hi}, departure limit {lo}; currently heard f′ = {fp}; at the closest approach the listener hears {fc}.
:::

## Faster than the wave: the wavefronts pile up into a cone {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Supersonic
:::

::: html step4-1
:::

This step answers: what if the source is faster than its own waves? For M = v/c > 1 the source outruns its wavefronts, and a single envelope line encloses all the rings, forming a **Mach cone** with half-angle α given by sinα = c/v = 1/M. For M < 1 the rings nest inside each other and there is no cone; at M = 1 the rings pile up at one point in front of the source. The picture is again in the source's frame. {#s4e .explain}

::: html step4-2
s4o: Raise M from 0.5 to 1 and then to 2.5: the rings go from nested to enclosed by a cone, with the cone getting sharper; check the half-angle α in the readout.
lMach: Mach number M = v/c
:::

::: strings
r4: M = {M}: {regime}; {cone}
regSub: subsonic, no cone
regSon: exactly the wave speed, rings pile up at a point ahead of the source
regSup: supersonic, a Mach cone forms
coneNone: No half-angle.
coneAng: Half-angle α = arcsin(1/M) = {al}°.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) the ring spacing is the wavelength λ = c/f; (2) for a moving source the rings ahead bunch up, f_ahead = f·c/(c − v), and behind f_behind = f·c/(c + v); (3) in any direction only the velocity component toward the listener matters, f′ = f/(1 − (v/c)cosθ); (4) a pass-by drops from high to low, more steeply for small b; (5) M > 1 gives a Mach cone with sinα = 1/M. {#s5e .explain}

::: html step5-2
qq: An ambulance approaches you at v = 0.5c with siren frequency f. What frequency do you hear?
qo0: 2f
qo1: 1.5f
qo2: 0.5f
s5m: This page considers a moving source and a listener at rest (for a moving listener the formula changes slightly: f′ = f(c ± v_listener)/c); the medium is still and the wave speed c is constant (c = 1 here, teaching units); the drawing is 2D with ring wavefronts; subsonic motion is covered in steps 1–3 and only step 4 gives the supersonic geometry; there is no decay of loudness with distance or air absorption; the animation is a teaching slow-motion.
lk0: Standing waves: another view of superposed waves and frequency
lk1: Interference: what happens when wavefronts overlap
lk2: Fourier: split a changing pitch into frequencies
:::

::: strings
qwhy: f_ahead = f·c/(c − v) = f/(1 − 0.5) = 2f (step 1: set v/c to 0.5 to check).
:::
