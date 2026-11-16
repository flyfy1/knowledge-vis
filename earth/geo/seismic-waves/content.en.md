---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Seismic Waves · The Core Was “Lit Up” by Waves
tagline: An earthquake sends out P and S waves that arrive one after the other; how they bend and get blocked inside the Earth gave the core — which nobody has visited — a size, a name and a state.
:::

## Two waves at different speeds arrive one after the other, and the gap tells you how far {#step0 h2=s0t pre=1}

::: strings
nav0: 0 P and S waves
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: First and second arrivals
:::

This step asks: how do you read the distance to the source from a seismogram? An earthquake sends out two kinds of body wave (waves through the Earth’s interior): the **P wave** is a compression wave (material pushes back and forth along the direction of travel) and is faster; the **S wave** is a shear wave (material swings sideways across the direction of travel), slower and stronger. In the crust we take vₚ = 6.5 km/s and vₛ = 3.7 km/s (approximate). Starting together, the arrival-time gap at distance d is Δt = d·(1/vₛ − 1/vₚ), about 0.116 s per km, so a larger Δt means a more distant source: d ≈ 8.6 km/s × Δt. **What to do:** drag the distance and press Replay to have the seismogram written out; the cyan line marks the P arrival, orange the S arrival, and the green bar is the S−P time. This is an idealised sketch, not a real record. {#s0e .explain}

::: html step0-2
s0cv: A station’s seismogram: P arrives first (cyan), S later and larger (orange), the green bar is S−P
replay: ▶ Replay the seismogram (6 s)
distL: Distance from source to station d (km)
:::

::: strings
seisTitle: schematic seismogram
lagLab: S−P = {v} s
s0ro: d = {d} km: P arrives at {tp} s, S at {ts} s, S−P = {lag} s; going back, S−P gives a distance of {back} km (each second of lag is about {k} km).
:::

## Knowing each station’s distance, how do you find the epicentre? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Three stations find the epicentre
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Draw circles by distance
:::

This step asks: one station tells you “how far” but not “which way” — how do you fix the epicentre? Each station turns its S−P time into a distance and draws a circle around itself; the epicentre must lie on the circle, and the three circles meet at one point, the epicentre (red). **What to do:** drag the epicentre: the three circles always meet at the red dot; then raise the “timing error” (assuming the three stations’ S−P are off by +1, −1 and +½ of it): the circles no longer meet at one point and a small triangle appears — that is the location uncertainty, which more stations reduce. This is a flat approximation with epicentre and stations on the ground plane, and each station’s S−P comes from step 0’s formula. {#s1e .explain}

::: html step1-2
s1cv: Three stations (squares) and the distance circles from S−P: they meet at the epicentre (red)
exL: Epicentre x (km)
eyL: Epicentre y (km)
errL: Timing error (s; stations are off by +1, −1 and +½ times it)
:::

::: strings
station: station {n}
epic: epicentre
s1ro: Epicentre ({ex}, {ey}) km: S−P at the three stations is {a} / {b} / {c} s → distances {da} / {db} / {dc} km; timing error factor {err} s.
:::

## Why don’t seismic waves travel in straight lines? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Rays bend in the Earth
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Waves bend in the Earth
:::

This step asks: why are ray paths inside the Earth curved? Deeper in the Earth P waves generally travel faster; like light going from air to water, a change in speed refracts the ray (see the [[reflection-refraction#step1|law of refraction]]). In a sphere of shells something is conserved along a ray: the ray parameter p = r·sinθ/v. So a ray heading into faster deeper material gradually **curves upward** and returns to the surface. Rays leaving the source (red dot) at different angles land along the surface (small dots) in a spreading arc; rays that reach the **core–mantle boundary** (depth 2891 km) enter the outer core, where speed suddenly drops, and are strongly refracted. **What to do:** drag the take-off angle: the thick white line is that ray and the readout gives its landing angular distance, travel time and deepest depth; notice the gap among the surface dots — the “shadow zone”. This is a simplified P-wave velocity model tracing transmitted rays only. {#s2e .explain}

::: html step2-2
s2cv: Cross-section of the Earth: a fan of rays (cyan: mantle only, orange: through the core), the white one is your chosen ray
i0L: Take-off angle θ (°, from vertical)
:::

::: strings
legMantle: rays through the mantle only
legCore: rays through the core
src: source
inCore: passes through the core
inMantle: stays in the mantle
s2ro: Take-off {i0}°: lands {delta}° away, travel time {time} min, deepest {depth} km ({core}). In the whole fan the largest gap among landing points is {g0}°–{g1}° (the real Earth’s P shadow zone is about 104°–140°; this simplified model gives slightly different numbers).
:::

## Why can some places not receive a given wave? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Shadow zones and the liquid core
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Shadow zones and the core
:::

This step asks: why can’t some distances on the far side of the Earth receive a direct P wave, and why does no S wave arrive at all? P rays entering the outer core are strongly refracted and land farther away, so there is a **shadow zone** for direct P between about 104° and 140° (this simplified model gives about 93°–113°). S waves are shear waves and cannot travel in a liquid, so they cannot enter the outer core — the S shadow zone starts at about 103° and extends to the far side. That S waves vanish this way is the evidence that **the outer core is liquid**; P waves that pass through the core come back as PKP. **What to do:** switch between P and S rays and drag the station’s angular distance: see whether any ray lands there; the readout lists the phases that arrive and their travel times. {#s3e .explain}

::: html step3-2
s3cv: A station (green square) at some angular distance: does any ray land there?
waveP: P-wave rays
waveS: S-wave rays
D3L: Station’s angular distance from the epicentre (°)
:::

::: strings
station3: station
gotP: P arrives, about {t} min
noP: no direct P (shadow zone)
gotS: S arrives, about {t} min
noS: no S wave (blocked by the liquid outer core)
pdirect: direct P (travel time about {t} min)
pkp: P through the core (PKP, about {t} min)
sdirect: direct S (travel time about {t} min)
whyShadow: at this distance rays either turn too shallow in the mantle or enter the core and are refracted farther away, so no direct P arrives
whyCoreP: beyond the shadow zone, P waves through the core arrive again
whyAll: rays through the mantle arrive directly
s3ro: Angular distance {D}°: {p}; {s}. {why}.
:::

## One more unit of magnitude: how much more energy? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Magnitude and energy
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Magnitude and energy
:::

This step asks: why do earthquakes of similar magnitude differ so hugely in destructive power? **Magnitude** M is a logarithmic scale: every tenfold increase in the largest recorded amplitude adds 1 to M. The energy released follows the empirical formula E ≈ 10^(1.5M + 4.8) joules, so each extra unit of magnitude means about 31.6 times more energy (10^1.5), and a difference of 2 units is about 1000 times the energy. **What to do:** drag the magnitude: the cyan line (amplitude, ten times per grid line) and the orange line (energy, 31.6 times per unit) have different slopes; the readout converts to a TNT equivalent for scale. This is an empirical formula; regions and magnitude scales differ slightly. {#s4e .explain}

::: html step4-2
s4cv: Magnitude against relative amplitude (cyan) and energy (orange), logarithmic
magL: Magnitude M
:::

::: strings
magAxis: magnitude M
legEnergy: energy (joules, log axis)
legAmp: relative amplitude (log axis)
s4ro: Magnitude {M}: energy about {E} J ≈ {tnt} of TNT; about {amp} times the amplitude of M2; each extra unit multiplies energy by {f}.
:::

## Seeing S−P, can you say how far the epicentre is? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Reading a seismogram
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Reading a seismogram
:::

This step asks: given a seismogram, how do you estimate the distance to the epicentre? The cyan and orange markers have been removed: read off where the P wave (small, first) and the S wave (large, later) begin, estimate S−P from the time axis (a grid line every 10 s), then use step 0’s d ≈ 8.6 km/s × (S−P) and drag your distance estimate and press Check. Within ±8% counts as correct. “Next” clears your estimate and check state. **What to do:** look for the small P wiggles first, then the clearly bigger S; the bigger the gap, the farther away. {#s5e .explain}

::: html step5-2
s5cv: An unlabelled schematic seismogram: a time-axis line every 10 s
guessL: My distance estimate (km)
chk5: Check
nx5: Next
recapTitle: Recap
recap1: P is fast, S is slow, and the bigger S−P the farther the source (about 8.6 km per second of lag); three stations’ distance circles meet at the epicentre.
recap2: Speed increasing with depth refracts and curves rays; at the core–mantle boundary P waves are strongly refracted making a shadow zone, and S waves vanish because liquid can’t carry them: the outer core is liquid.
recap3: Magnitude is logarithmic: each unit multiplies amplitude by 10 and energy by about 31.6.
modelTitle: Scope and limits of this model
modelText: Scope: distance estimates use constant crustal vₚ, vₛ; ray tracing uses a coarse, spherically symmetric, one-dimensional layered velocity model, transmitted rays only, ignoring reflections, diffraction and S waves in the inner core, so the shadow zone angles (about 93°–113° here) differ from the real Earth (about 104°–140°); the magnitude–energy relation is empirical; the waveforms are sketches, not records. All of this is for teaching and must not be used to locate real earthquakes.
link1: → Reflection and refraction: why a ray bends where the speed changes
link2: → Plate tectonics: field evidence from earthquake belts
link3: → Interference: how different waves add up on a seismogram
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: My estimate {g} km (S−P ≈ {lag} s). Read the trace, then press Check.
s5roOk: Correct: the true distance is {d} km (S−P ≈ {lag} s); your {g} km is within ±8%.
s5roNo: Not quite: the true distance is {d} km (S−P ≈ {lag} s); your {g} km is off by more than 8%.
docTitle: Seismic Waves · The Core Was “Lit Up” by Waves
:::
