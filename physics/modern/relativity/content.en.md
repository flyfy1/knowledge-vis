---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Special Relativity · The Lines of “Now” Tilt
tagline: The speed of light is the same for everyone, so clocks run slow, lengths shrink and “at the same time” depends on who is looking — a spacetime diagram draws it all.
:::

## A moving light clock ticks slower {#step0 h2=s0t pre=1}

::: strings
nav0: 0 The light clock
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: A consequence of a constant light speed
:::

This step asks: if the speed of light is the same for every observer, what happens to time? A **light clock** is two mirrors with a pulse of light bouncing between them; one round trip is a “tick”. We set c = 1 and write β for speed as a fraction of the speed of light. At rest the light goes straight up (green, distance 1). An observer who sees the clock moving right at β sees the light go diagonally: it has to rise 1 and also drift sideways by βγ with the clock, and since the light’s speed is fixed the longer diagonal takes longer. The moving clock’s ticks are stretched by **γ = 1/√(1 − β²)**, called **time dilation**. **What to do:** drag β: the diagonal leans further; at β = 0.99, γ ≈ 7. This is an ideal light clock, but the conclusion holds for any clock. {#s0e .explain}

::: html step0-2
s0cv: Left: a light clock at rest, light goes straight; right: the same clock moving, seen by an observer with a slanted, longer light path
betaL: Clock speed β (fraction of light speed)
:::

::: strings
atRest: at rest
moving: moving (observer’s view)
oneWay: one-way time ×{t}
shift: clock moves βγ = {d} sideways
squeezed: horizontal scale compressed to fit
s0ro: β = {b}: γ = {g}; one tick of the moving clock lasts {tick} ticks of a clock at rest, so it runs at {rate} of the rest rate — {pct}% slow.
:::

## With a different observer, how do the coordinates of the same event change? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Spacetime diagram
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Draw events on spacetime
:::

This step asks: how do different observers label the same event? On a **spacetime diagram** the horizontal axis is position x and the vertical axis is ct (the distance light travels in that time), so light rays are the 45° orange dashes. An **event** is a point in spacetime; A is the origin and B can be dragged. An observer moving at β has their own axes (cyan): their time axis ct′ is their own world line (x = β·ct) and their space axis x′ leans toward the light line the same way (ct = β·x), with the grid slanted accordingly. The **Lorentz transformation**: x′ = γ(x − β·ct), ct′ = γ(ct − β·x). **What to do:** drag β: the cyan axes close in on the orange light lines, but the light lines stay at 45°; the **interval** ct² − x² is the same for all observers. Two events with ct² − x² &gt; 0 (timelike) are ordered the same by everyone; with &lt; 0 (spacelike) they are not. {#s1e .explain}

::: html step1-2
s1cv: Spacetime diagram: grey is the resting observer’s grid, cyan the moving observer’s, orange dashes are light
evX: Event B’s x
evT: Event B’s ct
:::

::: strings
axX: x
axT: ct
axXp: x′
axTp: ct′
lightLine: light
k_light: lightlike (right on a light ray)
k_time: timelike (can be causally linked)
k_space: spacelike (cannot be causally linked)
s1ro: β = {b} (γ = {g}): event B is (x, ct) = ({x}, {ct}) at rest and (x′, ct′) = ({xp}, {ctp}) for the moving observer; the interval ct² − x² = {s} (same for everyone) is {kind}.
:::

## I see two lightning flashes at once; what does a moving person see? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Simultaneity
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: “Simultaneous” is not absolute
:::

This step asks: are two events that happen at the same time still simultaneous for a moving observer? In the resting frame, flashes E₁ and E₂ happen at x = −2 and x = +2 at the same instant ct = 0 (grey horizontal line). For an observer moving right at β, events “at the same moment” lie on a line of slope β (the direction of the cyan x′ axis): the dashed lines. E₁ and E₂ lie on different dashed lines, so their readings of ct′ differ. **What to do:** drag β: the dashed lines tilt more, and the time gap −4γβ between E₂ and E₁ grows: they see the right-hand flash E₂ first. This relativity of simultaneity follows directly from a constant light speed; only spacelike-separated events can be ordered differently by different observers, so causes still precede effects for everyone. {#s2e .explain}

::: html step2-2
s2cv: The same pair of events: simultaneous at rest (grey) and the moving observer’s lines of “now” (cyan dashes) crossing different times
:::

::: strings
simS: resting observer’s line of now
simSp: moving observer’s lines of now
sameTime: at the same time
firstE1: E₁ before E₂
firstE2: E₂ before E₁
s2ro: β = {b} (γ = {g}): the moving observer reads E₁ at ct′ = {t1} and E₂ at ct′ = {t2}, a gap of {d}: {first}.
:::

## Their lifetime is only 2.2 microseconds — how do they reach the ground? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Muon lifetimes
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Evidence from muons
:::

This step asks: is there real evidence for time dilation? Cosmic rays make muons at 15 km altitude; at rest their mean lifetime is 2.2 μs, and they travel at a β close to 1. Without relativity, covering 15 km takes t = 15 km / (β·c) and the survival chance is about e<sup>−t/2.2 μs</sup> — practically zero. With time dilation the ground observer sees the lifetime stretched to γ × 2.2 μs and the survival chance is far larger; measurements agree with this. From the muon’s own view, the 15 km ahead of it is shortened to 15 km/γ (**length contraction**). **What to do:** drag β: bar length shows the logarithm of the survival chance; the red bar (no relativity) sinks to the bottom while the green bar (relativity) keeps a sizeable fraction. {#s3e .explain}

::: html step3-2
s3cv: Fraction of muons reaching the ground (log bars): without relativity vs with time dilation
:::

::: strings
mNo: prediction without relativity
mYes: prediction with time dilation
lblNo: flight {t} μs, lifetime {tau} μs
lblYes: same flight, lifetime stretched to {t} μs
logBar: bars show the log of the fraction (empty = below 10⁻¹¹, full = 100%)
s3ro: β = {b} (γ = {g}): the 15 km takes {tl} μs (ground clock); survival without relativity {no}, with time dilation {yes} ({ratio} times larger); the distance in the muon’s frame is {h} km.
:::

## Fire something at 0.8c from a ship moving at 0.8c — is it 1.6c for the ground? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Adding velocities
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Light speed doesn’t add
:::

This step asks: how do you combine two velocities? Everyday experience says simply add: u = v + w. But if the speed of light is constant that rule must fail; the relativistic rule is **u = (v + w)/(1 + v·w)** (units of c). **What to do:** drag v and w: the red bar is plain addition and turns red past 1 (light speed); the green bar never exceeds 1; at w = 1 (a light pulse fired from the ship), u = 1 whatever v is, because light has the same speed for every observer. The curves below show u against w for the chosen v. For small v and w (say 0.05) the two rules almost agree, which is why everyday life shows no difference. {#s4e .explain}

::: html step4-2
s4cv: Top: speed bars (red = plain addition, green = relativistic); bottom: u against w
vL: Ship speed v relative to ground (c)
wL: Object speed w relative to ship (c)
:::

::: strings
cLine: light speed c = 1
naiveLab: plain addition = {s} c
relLab: relativistic = {s} c
overC: faster than light!
wAxis: w (speed relative to the ship)
uAxis: u (speed relative to the ground)
lightStays: what you fire is light, which is still light speed for the ground
naiveBreaks: plain addition gives more than light speed, so it fails at high speed
s4ro: v = {v}, w = {w}: plain addition {n}, relativistic u = {u}. {tail}
:::

## How much energy does it take to push a particle up to the speed of light? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Energy and the speed of light
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Why you can’t reach light speed
:::

This step asks: why can’t anything with mass catch up with light? The classical kinetic energy is ½mv² (cyan, ½β² in units of mc²), while the relativistic one is (γ − 1)·mc² (orange). They almost coincide at low speed, but as β nears 1, γ grows without limit and the required energy diverges: at β = 0.99 the kinetic energy is already over 6 times the rest energy mc². **What to do:** drag β: the orange point climbs ever more steeply; the readout also gives the kinetic energy of an electron (rest energy 0.511 MeV). In accelerators the particles’ speed barely changes any more while energy keeps being added, because it all goes into γ — that is, into mass–energy. {#s5e .explain}

::: html step5-2
s5cv: Kinetic energy (in units of rest energy mc²) against β: cyan classical, orange relativistic
recapTitle: Recap
recap1: A constant light speed gives time dilation γ = 1/√(1−β²) and length contraction L₀/γ; muons reaching the ground are the proof.
recap2: On a spacetime diagram a moving observer’s axes close toward the light lines; ct² − x² is an interval everyone agrees on; spacelike events can be ordered differently, timelike ones cannot.
recap3: Speeds combine as u = (v+w)/(1+vw) and never exceed c; the kinetic energy (γ−1)mc² diverges as β→1, so massive particles cannot reach c.
modelTitle: Scope and limits of this model
modelText: Scope: special relativity, inertial observers only (no gravity, no acceleration); one space dimension; speeds in units of c = 1; the muon numbers use a 15 km production height and 2.197 μs rest lifetime, ignoring energy loss in the air and the speed distribution, so the probabilities are single-speed illustrations; the light clock is an idealised thought experiment. Length contraction is explained in the text of step 3 only, not drawn on its own.
link1: → Doppler effect: frequency shifts between a moving source and an observer
link2: → Photoelectric effect: another quantum clue about light
link3: → Newton’s laws: at low speed relativity reduces to F = ma
:::

Page complete. {#done .readout .success i18n=text}

::: strings
legCl: classical ½β²
legRel: relativistic γ − 1
betaAxis: speed β = v/c
keAxis: kinetic energy / (mc²)
s5ro: β = {b} (γ = {g}): classical kinetic energy {kc}·mc², relativistic {kr}·mc² ({ratio} times larger); for an electron the relativistic kinetic energy is about {mev} MeV.
docTitle: Special Relativity · The Lines of “Now” Tilt
:::
