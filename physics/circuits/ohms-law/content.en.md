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
pageTitle: Ohm’s Law · Current You Tune by Hand
tagline: Voltage pushes, resistance holds back: I = V/R isn’t something to memorise but something you tune on a slider.
:::

## Double the voltage and the current doubles {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Voltage and current
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: Current follows voltage
:::

This step asks: how are the current in a circuit and its voltage related? **Voltage V** (volts, V) is the energy the source gives each unit of charge; **current I** (amperes, A) is the charge passing a point on the wire each second. The resistor stays at 10 Ω; only the voltage changes. The dots only show direction and relative size, not the real speed of electrons (see [[simple-circuits#step4|simple circuits]] for the complete loop). **What to do:** drag the voltage and press “Record this point” at several values; on the right the points line up on a straight line through the origin — current is proportional to voltage. You can pause the flow; the slider changes the source voltage, not the resistor. {#s0e .explain}

::: html step0-2
s0cv: Left: circuit with flow sketch; right: current–voltage graph where recorded points form a line
pause: Pause flow
rec: Record this point
clr: Clear recorded points
voltL: Source voltage V (V)
:::

::: strings
resume: Resume flow
voltAxis: voltage V (V)
currAxis: current I (A)
s0ro: V = {V} V, R = {R} Ω → I = V/R = {I} A; {n} points recorded; V/I = {ratio} Ω (the ratio stays constant when the points form a line through the origin).
:::

## Same voltage, bigger resistance, smaller current {#step1 h2=s1t pre=1}

::: strings
nav1: 1 What resistance does
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: Resistance holds the current back
:::

This step asks: with the voltage fixed, what happens if you swap in a larger resistor? **Resistance R** (ohms, Ω) is defined by R = V/I: how many volts it takes to drive 1 A through. The source stays at 6 V and only R changes. **What to do:** drag R and watch the orange point slide along the curve on the right; doubling R should halve I (the readout shows the predicted half) while the product I×R always equals 6 V. The dots slow down as the current drops, still only as a relative sketch. {#s1e .explain}

::: html step1-2
s1cv: Left: the circuit; right: current against resistance at a fixed 6 V, I = 6/R
resL: Resistance R (Ω)
:::

::: strings
resAxis: resistance R (Ω)
s1ro: V = {V} V, R = {R} Ω → I = {I} A; if R doubled, I would be {half} A; I×R = {prod} V.
:::

## A hotter filament resists more: current stops being proportional to voltage {#step2 h2=s2t pre=1}

::: strings
nav2: 2 A filament breaks the rule
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: Not every component obeys
:::

This step asks: does Ohm’s law hold for every component? It says that for a component whose **resistance does not change with voltage** (a fixed resistor), I is proportional to V; such components are called **ohmic**. A bulb filament heats up when current flows and its resistance rises (model: R = R₀(1 + γ·P), R₀ = {R0} Ω, γ = 0.05 per W, P = VI the power in the filament), so its I–V curve bends downward. **What to do:** drag the voltage: cyan (a 6 Ω fixed resistor) is a straight line, orange (the bulb) bends; the “apparent resistance” V/I in the readout stays fixed for the resistor but climbs with voltage for the bulb. {#s2e .explain}

::: html step2-2
s2cv: I–V curves: cyan fixed resistor (straight), orange bulb (curved)
:::

::: strings
legRes: fixed resistor {R} Ω
legBulb: bulb (filament heats up)
s2ro: V = {V} V: fixed resistor I = {Ir} A (V/I = {Rr} Ω, unchanged); bulb I = {Ib} A (V/I = {Rb} Ω, cold value {R0} Ω).
:::

## A bigger resistance can mean more power or less {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Power and heat
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: Where the energy goes
:::

This step asks: when the resistance grows, how does the power it uses change? **Power P** (watts, W) is electrical energy converted per second, P = V·I = I²R = V²/R; in a resistor this is heat per second. The answer depends on what you hold fixed: with **voltage** fixed (a set supply) P = V²/R, so a bigger R means less power; with **current** fixed (a constant-current source) P = I²R, so a bigger R means more power. **What to do:** switch the held quantity, then drag R and watch which way the orange point moves along the curve; all three formulas in the readout agree. {#s3e .explain}

::: html step3-2
s3cv: Power against resistance: holding voltage and holding current give opposite trends
holdV: Hold voltage 6 V
holdI: Hold current 0.6 A
:::

::: strings
powAxis: power P (W)
s3ro: {mode}, R = {R} Ω: V = {V} V, I = {I} A; P = VI = {P} W, I²R = {P2} W, V²/R = {P3} W.
:::

## Which load takes the most power from a battery? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 A battery’s own resistance
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: Batteries resist too
:::

This step asks: how much power can a real battery deliver to an outside load? A battery has an **EMF** E = 6 V (its terminal voltage with no load) and an **internal resistance** r (the battery’s own resistance), in series with the load R: I = E/(R + r); the load gets V = IR, which is below E, and r also heats up. The load power P = I²R rises with R and then falls; it peaks at R = r with value E²/(4r), where the efficiency η = R/(R+r) is only 50%. **What to do:** pick an r, drag R, and check that the orange point tops out at the green point (R = r). {#s4e .explain}

::: html step4-2
s4cv: Load power against load resistance, peaking at R = r
loadL: Load resistance R (Ω)
:::

::: strings
loadAxis: load resistance R (Ω)
peakLabel: max {p} W at R = r = {r} Ω
s4ro: r = {r} Ω, R = {R} Ω: I = {I} A, load voltage {V} V, load power {P} W, heat in the battery {loss} W, efficiency {eta}%.
:::

## How big is the hidden resistor? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Measure a mystery resistor
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: Use it: measure a resistor
:::

This step asks: with only an ammeter, how can you tell the size of a resistor you can’t see? The circuit has an unknown resistor. Drag the voltage and record a few points; the slope of the line they form on the I–V graph is 1/R, or you can estimate directly from R = V/I. Choose an answer and press Check, then Next for another. **What to do:** at 0 V the current is 0, which tells you nothing about R; a larger voltage reads more clearly. “Clear” removes both the recorded points and your pick. {#s5e .explain}

::: html step5-2
s5cv: Left: the circuit with the unknown resistor; right: the points you recorded
clr5: Clear points and pick
nx5: Another unknown
chk5: Check answer
recapTitle: Recap
recap1: Ohm’s law: for a fixed resistor I = V/R, the I–V graph is a line through the origin with slope 1/R; double R, halve I.
recap2: Filaments and similar parts change resistance with temperature, so their I–V curves bend and Ohm’s law does not apply; P = VI = I²R = V²/R, and which quantity you hold fixed sets the trend.
recap3: A battery has internal resistance r: the load gets the most power at R = r, but the efficiency is then only half.
modelTitle: Scope and limits of this model
modelText: Scope: DC, steady state, lumped components, wire resistance ignored; a fixed resistor keeps its value at every voltage (in reality it drifts a little with heat); the filament uses the simplified R = R₀(1+γP); the battery is an ideal “EMF + constant internal resistance”. The flowing dots are a teaching sketch whose speed is only proportional to current, not the electrons’ drift speed.
link1: → Simple circuits: power and rated power
link2: → Electrochemistry: how a battery’s voltage sags as it discharges
link3: → Electric fields: voltage is really a potential difference
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: At V = {V} V the ammeter reads I = {I} A; {n} points recorded. Pick an answer, then check.
s5roOk: Correct: R = V/I = {V}/{I} = {R} Ω.
s5roNo: Not quite: you picked {guess} Ω, but R = V/I = {V}/{I} = {R} Ω.
docTitle: Ohm’s Law · Current You Tune by Hand
:::
