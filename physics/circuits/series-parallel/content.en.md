---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Series & Parallel · Splitting and Merging Current
tagline: Two sluice gates on one river end to end are in series; a river that splits into two branches and rejoins is in parallel — how do current and voltage divide? The flowing dots show it.
:::

## Series: the current is the same everywhere, the voltage divides by resistance {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Series
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: End to end
:::

This step asks: when two resistors are connected end to end (**in series**), how do current and voltage divide? The source is fixed at 12 V. The loop has only one path, so the **current** (charge passing per second, in amperes, A) is the same everywhere and the dots move at the same pace; the total resistance is the sum R = R₁ + R₂ and the current I = V/R (see [[ohms-law#step1|Ohm’s law]]); the **voltage** (in volts, V) across each resistor is V₁ = I·R₁ and V₂ = I·R₂, so the larger resistor takes more, and the two add up to the source voltage. **What to do:** drag R₁ or R₂: the current changes (dot speed), and in the readout V₁ : V₂ always equals R₁ : R₂. You can pause the animation; the dots only show relative speed, not real electron speed. {#s0e .explain}

::: html step0-2
s0cv: Series circuit: one current passes through both resistors, each taking part of the voltage
pause: Pause flow
r1L: Resistance R₁ (Ω)
r2L: Resistance R₂ (Ω)
:::

::: strings
resume: Resume flow
s0ro: R₁ = {r1} Ω, R₂ = {r2} Ω: current I = 12/(R₁+R₂) = {I} A (the same everywhere); V₁ = {v1} V, V₂ = {v2} V, together {sum} V; V₁ : V₂ = R₁ : R₂ = {ratio}.
:::

## Parallel: the voltage is the same everywhere, the current divides inversely with resistance {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Parallel
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Fork and rejoin
:::

This step asks: when two resistors sit side by side between the same pair of nodes (**in parallel**), how does the current divide? Each branch is connected straight across the source, so every branch has 12 V; each branch current is I = V/R, larger in the smaller resistance; the total current is the sum of the branch currents. **What to do:** drag R₁ or R₂: the branch whose R gets smaller has faster dots and a larger current, and the total current (left side) changes with it; in the readout the ratio of the branch currents is the inverse of the resistance ratio (R₂/R₁). {#s1e .explain}

::: html step1-2
s1cv: Parallel circuit: the current splits at a node in two, each branch carrying the source voltage
:::

::: strings
s1ro: R₁ = {r1} Ω, R₂ = {r2} Ω: I₁ = 12/R₁ = {i1} A, I₂ = 12/R₂ = {i2} A, total I = I₁ + I₂ = {I} A; I₁ : I₂ = R₂ : R₁ = {ratio}.
:::

## Add one more bulb: does the total resistance rise or fall? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Total resistance
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: What they add up to
:::

This step asks: how does the total current change as more identical bulbs are added? Each bulb is 6 Ω and the source 12 V. The **equivalent resistance** is the value of a single resistor that could replace the whole circuit and carry the same current: n bulbs in series give R = 6n (each extra raises it), n in parallel give R = 6/n (each extra lowers it, below any single one, because it adds another path). **What to do:** drag the number of bulbs n: the cyan line (series) has a falling total current as n grows and each bulb gets 12/n volts, so it dims; the orange line (parallel) has a rising total current while each bulb still gets 12 V and keeps its brightness. {#s2e .explain}

::: html step2-2
s2cv: Total current against the number of bulbs n: falls in series (cyan), rises in parallel (orange)
nL: Number of bulbs n
:::

::: strings
legSer: series: I = 12/(6n)
legPar: parallel: I = 12n/6
nBulbs: number of bulbs n
iAxis: total current (A)
s2ro: n = {n} (each {rb} Ω): series R = {rs} Ω, I = {is} A, {ps} W per bulb; parallel R = {rp} Ω, I = {ip} A, {pp} W per bulb.
:::

## Unscrew one bulb: do the others stay lit? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Unscrew a bulb
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: If one fails
:::

This step asks: why does one broken bulb darken everything in some strings and nothing in others? Three identical bulbs of 6 Ω on a 12 V source. Press “Unscrew” to take one out (the circuit opens at that spot). In **series** there is only one path: open it once and no current flows, so everything goes out; and the more bulbs, the less voltage each gets and the dimmer they are. In **parallel** each bulb has its own branch: remove one and the rest still get 12 V and stay as bright, while the total current falls. **What to do:** choose the wiring, then unscrew bulbs one at a time and watch how many stay lit and the total current in the readout. “Put all back” refits every bulb. {#s3e .explain}

::: html step3-2
s3cv: Three bulbs: series (one path) and parallel (a branch each), brightness drawn from power
wireS: Wire in series
wireP: Wire in parallel
putBack: Put all bulbs back
unscrew1: Unscrew / refit bulb 1
unscrew2: Unscrew / refit bulb 2
unscrew3: Unscrew / refit bulb 3
:::

::: strings
bulbN: bulb {n}
removed: removed
ammeter: total current {I} A
inSeries: Series
inParallel: Parallel
allOut: open at one place, so all go out
allDim: each of three bulbs gets 4 V, so they are dim
othersStay: the others are unaffected
s3ro: {mode}, {n} unscrewed: {lit} lit, total current {I} A ({res}).
:::

## One resistor in series with two in parallel — how do you work it out? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Mixed wiring
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Mixed wiring
:::

This step asks: how do you calculate a circuit with both series and parallel parts? First combine the parallel part R₂, R₃ into an equivalent R₂₃ = R₂R₃/(R₂ + R₃); it is in series with R₁, so the total resistance is R = R₁ + R₂₃ and the total current I = 12/R. R₁ takes V₁ = I·R₁; the remaining V₂₃ = 12 − V₁ appears across both R₂ and R₃, giving currents I₂ = V₂₃/R₂ and I₃ = V₂₃/R₃. **What to do:** drag the three resistors and check two rules in the readout: the voltages V₁ + V₂₃ = 12 V (voltage drops around the loop add up to the source) and the currents I₂ + I₃ = I (current is conserved across the fork). {#s4e .explain}

::: html step4-2
s4cv: Mixed circuit: R₁ in series with (R₂ ∥ R₃)
r3L: Resistance R₃ (Ω)
:::

::: strings
s4ro: R₂∥R₃ = {r23} Ω, total resistance {req} Ω, total current {I} A; V₁ = {v1} V, V₂₃ = {v23} V, V₁ + V₂₃ = {vs} V; I₂ = {i2} A, I₃ = {i3} A, I₂ + I₃ = {is} A (equal to the total {I} A).
:::

## Why are house appliances in parallel, and the fuse in series on the main line? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 House wiring
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Put it to use
:::

This step asks: how is house wiring connected, and why does it trip? Household sockets give about 230 V and every appliance is connected **in parallel** across the same pair of wires, so each gets 230 V and works independently, drawing I = P/V (P is power in watts, W); the total current is the sum over appliances and all of it passes through the **fuse** (or circuit breaker), which is in **series** with them and blows or trips when the total exceeds its rating (13 A here), cutting everything off. **What to do:** switch appliances on one by one: the lamp and TV draw little, the kettle 7.8 A and the heater 8.7 A, and two high-power ones together exceed 13 A and trip; press “Reset the fuse” to restore. Appliances are treated as pure resistors, ignoring wire resistance and start-up surges. {#s5e .explain}

::: html step5-2
s5cv: Total-current bar against the fuse rating; each appliance in parallel with its own current
app_lamp: Lamp
app_tv: TV
app_kettle: Kettle
app_heater: Heater
resetFuse: Reset the fuse
recapTitle: Recap
recap1: Series: the same current everywhere, R = R₁ + R₂, voltage divides by resistance; parallel: the same voltage, 1/R = 1/R₁ + 1/R₂, current divides inversely with resistance.
recap2: Adding bulbs: in series each dims and the total current falls, in parallel brightness stays and the total current rises; one open point puts a series string out, parallel bulbs are independent.
recap3: For mixed wiring combine the parallel part first, then add the series part; house appliances are in parallel with a fuse in series on the main line that cuts off on excess current.
modelTitle: Scope and limits of this model
modelText: Scope: DC, an ideal source (no internal resistance), fixed resistances (bulb resistance does not change with temperature) and resistance-free wires; step 5 treats household appliances as pure resistors at a steady 230 V, ignoring start-up surges, wire drop and AC phase. The flowing dots are a teaching sketch whose speed is only proportional to current, not electron speed; they stop under reduced motion or when the page is hidden.
link1: → Simple circuits: why a loop has to be closed
link2: → Ohm’s law: how I = V/R is tuned
link3: → Ohm’s law: power P = VI and heating
:::

Page complete. {#done .readout .success i18n=text}

::: strings
mainsCur: total current {I} A
fuseLine: fuse {f} A
tripped: tripped: everything is off
wouldTrip: would trip
safe: safe
s5ro: Total current {I} A (power {p} W), fuse rating {f} A: {state}.
s5roTrip: Tripped: the combined current would have been {I} A, above the {f} A rating, and the fuse cut off the whole circuit. Press “Reset the fuse” to restore.
docTitle: Series & Parallel · Splitting and Merging Current
:::
