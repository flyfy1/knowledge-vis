---
lang: en
---

::: strings
pageTitle: Electromagnetic Induction · Change the Flux, Get a Voltage
tagline: Pass a magnet through a coil, see how the rate of change of flux becomes a voltage, then how Lenz's law sets the direction and a spinning coil makes a generator.
:::

## First, measure how much field passes through the coil {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Flux
:::

::: html step0-1
:::

This step answers: what is **magnetic flux** Φ, and how does it depend on the magnet's position? Flux is the total magnetic field passing perpendicularly through the coil's plane (field strength × area, with sign). The coil is the upright ring; the magnet (N at the right end, S at the left) slides along the axis. Flux is largest with the magnet at the centre and drops quickly farther away. Φ(z) = 1 / (1 + z²)^{3/2} (coil radius = 1, dipole approximation, teaching units). {#s0e .explain}

::: html step0-2
s0o: Drag the magnet position z: the dot on the curve below follows, and the readout gives Φ — largest at z = 0, smaller as |z| grows.
lZ: Magnet position z
:::

::: strings
r0: z = {z}: Φ = 1/(1+z²)^{3/2} = {phi} ({pct}% of the maximum).
:::

## The faster the flux changes, the bigger the voltage {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Rate of change = voltage
:::

::: html step1-1
:::

This step answers: where does the voltage across the coil come from? **Faraday's law**: the induced emf is ε = −N dΦ/dt (N is the number of turns, here N = 1), the rate of change of flux; if Φ is steady there is no voltage. The magnet swings through the coil as z = 3 sin ωt. Press play: cyan is Φ(t), orange is ε(t), and the curves build up on the right as time passes. {#s1e .explain}

::: html step1-2
s1o: After playing, notice ε = 0 where Φ peaks (magnet at the centre) and ε is largest where Φ changes fastest; double ω and replay: by what factor does the peak of ε change?
lW: Magnet oscillation frequency ω
bPlay: Play / Pause
bReset: Reset: clear the curves and go back to the start
:::

::: strings
r1: t = {t}: Φ = {phi}, ε = −dΦ/dt = {eps}; peak |ε| so far = {peak}.
hint1: Press Play to start
:::

## Lenz's law: the induced current opposes the change {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Lenz's law
:::

::: html step2-1
:::

This step answers: which way does the induced current circulate? **Lenz's law**: the field made by the induced current opposes the change in flux (it weakens an increase and compensates a decrease). Seen from the right (+z side), a counter-clockwise current makes a field pointing right (+z). The magnet sits left of the coil at z = −1.5; a positive velocity v means approaching. Green is the induced current and the pink arrow is the field it makes. {#s2e .explain}

::: html step2-2
s2o: Swing v from positive to negative (approach to retreat): the current reverses; press flip: it reverses again; at v = 0 there is no current.
lV: Magnet velocity v
bFlip: Flip the magnet (swap N and S)
:::

::: strings
r2: Flux rate dΦ/dt = {dphi} ({trend}); ε = {eps}; induced current is {dir}, its field points {bdir}.
trendUp: increasing
trendDown: decreasing
trendNone: steady
dirCcw: counter-clockwise (seen from the +z side)
dirCw: clockwise (seen from the +z side)
dirNone: zero
bRight: +z (right)
bLeft: −z (left)
bNone: nowhere
:::

## Turns and speed: each scales the voltage {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Turns and speed
:::

::: html step3-1
:::

This step answers: how do you get a bigger voltage? ε = −N dΦ/dt: more turns N add up the voltage of each turn, and a faster magnet makes dΦ/dt larger. Grey is the baseline N = 1, ω = 1 (one period); orange is the current setting, on the same axes. The peak in the readout is found by evaluating one full period point by point. {#s3e .explain}

::: html step3-2
s3o: Change only N: the shape stays, the height scales; change only ω: the curve gets taller and narrower. Check that the "peak ratio" in the readout equals N × ω.
lN: Coil turns N
:::

::: strings
r3: Peak |ε| = {peak} (baseline {base}), peak ratio = {ratio}; N × ω = {nw}. Period = {per}.
:::

## A generator: spin the coil and the flux changes by itself {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Generator
:::

::: html step4-1
:::

This step answers: without moving the magnet, how can flux change? Spin a coil of area A = 1 in a uniform field B: Φ = BA cos θ with θ = ωt. Then ε = BAω sin ωt, a sine wave with peak BAω. Press play: the coil (side view) is on the left, and the Φ (cyan) and ε (orange) curves build up on the right. {#s4e .explain}

::: html step4-2
s4o: After playing, raise ω: the sine gets denser and taller; raise B: taller but the same spacing. Notice ε = 0 when the coil is perpendicular to the field (Φ at its maximum).
lWr: Coil rotation rate ω
lB: Magnetic field B
:::

::: strings
r4: f = ω/2π = {f}; peak BAω = {peak}; RMS = peak/√2 = {rms} (numerical RMS over one period {rmsn}); t = {t}, θ = {th}°, ε = {eps}.
:::

## Recap and self-check {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Recap & check
:::

::: html step5-1
:::

**Recap**: (1) flux Φ is the total field through the coil; (2) ε = −N dΦ/dt, so only change produces voltage; (3) Lenz's law gives the direction: oppose the change; (4) turns and speed each scale ε; (5) a spinning coil gives a sine-wave alternating voltage with peak BAω. {#s5e .explain}

::: html step5-2
qq: You double the number of turns and also double the magnet's oscillation frequency. By what factor does the peak emf change?
qo0: 2 times
qo1: 3 times
qo2: 4 times
s5m: This page uses a dipole approximation and a coil of radius 1 in teaching units, ignoring the coil's self-inductance and resistance (so no current feeds back on the magnet); in steps 1 and 3 the magnet follows a given motion, while in reality Lenz's law would brake it; in step 4 B is uniform and the coil has no load. The animation is a teaching slow-motion.
lk0: Magnetic force: the microscopic origin of an emf is the magnetic force on charges in the wire
lk1: Derivative: ε = −dΦ/dt is a rate of change; see how the derivative is built up
:::

::: strings
qwhy: Peak ∝ N × ω, and each factor doubles, so 4 times (check with the "peak ratio" in step 3).
:::
