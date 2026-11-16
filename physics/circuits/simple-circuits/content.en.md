---
lang: en
---

::: strings
back: ← Knowledge Index
category: Physics & Circuits
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Simple Circuits · Current Must Go Round
tagline: A battery, a switch and a bulb joined into one complete loop make the bulb light; break it anywhere and the current stops all round at once.
:::

## What must be true for the bulb to light? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One loop
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: ONE LOOP
:::

This step answers: why is the bulb sometimes lit and sometimes not? The battery provides the “voltage” that pushes charge, and wires join battery, switch and bulb into a loop. Only when the loop is **complete and closed** can charge keep going round, forming a **current**. Toggle the switch and watch the bulb. The small dots only show the direction of flow (starting from the battery’s positive end), not real speed. {#s0e .explain}

::: html step0-2
s0cv: A loop of battery, switch and bulb
:::

::: strings
sw: Switch
swOn: Close the switch
swOff: Open the switch
pause: Pause flow animation
resume: Resume flow animation
s0ro: Switch {sw}: the loop is {loop}, the bulb is {bulb}, current {i} A.
swClosed: closed
swOpen: open
loopYes: complete
loopNo: broken
bulbOn: lit
bulbOff: off
:::

## If a wire breaks in different places, what does the bulb do? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Where it breaks
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: WHERE IT BREAKS
:::

This step answers: where must the loop be broken to put the bulb out? There are four wire sections A, B, C and D, with the switch closed. The buttons cut a section at that place (press again to reconnect): wherever you cut, all the dots stop together, because the current is the same everywhere in one loop. {#s1e .explain}

::: html step1-2
s1cv: Cutting one section of the loop
cutA: Cut A (top left)
cutB: Cut B (top right)
cutC: Cut C (bottom right)
cutD: Cut D (bottom left)
restore: Reconnect all
:::

::: strings
s1ro: Cut wires: {list}. The loop is {loop}, the bulb is {bulb}.
none: none
:::

## Put different things in the gap of the loop: does the bulb light? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Conductors
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: CONDUCTORS
:::

This step answers: which materials let current through? The loop has a gap at the bottom and you put one object in it: a **conductor** (like copper or iron) lets charge through and the bulb lights; an **insulator** (like rubber or plastic) does not, and the bulb stays off. Choose a material and watch the bulb and dots. {#s2e .explain}

::: html step2-2
s2cv: The material in the gap decides whether the bulb lights
matLabel: Choose the material for the gap
:::

::: strings
mCopper: Copper wire
mIron: Iron nail
mFoil: Aluminium foil
mGraphite: Pencil lead
mSalt: Salt water
mRubber: Eraser
mPlastic: Plastic ruler
mWood: Dry wooden stick
mGlass: Glass
s2ro: With {mat} in the gap: {kind}, the bulb is {bulb}.
kindCond: it is a conductor
kindIns: it is an insulator
:::

## What happens if a wire joins the two ends of the bulb directly? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Short circuit
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: SHORT CIRCUIT
:::

This step answers: why is a short circuit dangerous? Two cells (3 V) with 1 Ω of internal resistance in total, and a 6 Ω bulb. A “shorting wire” gives the current an almost resistance-free shortcut around the bulb: the bulb goes dark but the current becomes very large, and the battery and wires heat up much more. A thicker wire in the picture means more current. {#s3e .explain}

::: html step3-2
s3cv: A shorting wire lets current bypass the bulb
:::

::: strings
shortOn: Add the shorting wire
shortOff: Remove the shorting wire
s3ro: {state}: current {i} A, bulb power {pb} W, heat in the battery’s internal resistance {pr} W.
stNormal: Normal
stShort: Shorted
s3roCmp: The shorted current is {x} times the normal one, and the heating inside the battery is {h} times.
:::

## Do more cells in series make the bulb brighter? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 More cells
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: MORE CELLS
:::

This step answers: what does a higher voltage do to the bulb? Each cell is 1.5 V with 0.5 Ω internal resistance; in series the voltages add and so do the internal resistances. The bulb is 6 Ω and rated at 2.5 W. Current = total voltage ÷ total resistance, and bulb power = current² × 6. More power means brighter, and beyond the rating the filament burns out. {#s4e .explain}

::: html step4-2
s4cv: Cells in series and the bulb’s brightness
cells: Cells in series
:::

::: strings
s4ro: {n} cell(s): {v} V, current {i} A, bulb power {p} W (rated {pr} W){res}.
resOk: , brightness {pct}%
resBurn: , above the rating, so the filament burns out and the loop opens
:::

## Diagnose it: what is wrong with this circuit? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: from the state of a circuit, can you name the cause? Each question shows a circuit in a different state; pick your diagnosis, then check. {#s5e .explain}

::: html step5-2
s5cv: The circuit to diagnose
dgNormal: All fine, complete loop
dgSwitch: Switch is open
dgCut: A wire is broken
dgShort: Short circuit
check: Check diagnosis
next: Next one
recapTitle: Recap
recap1: Current needs a complete loop: source, wires and appliance joined end to end.
recap2: In a single loop the current is the same everywhere, so a break anywhere stops the whole loop.
recap3: Conductors pass charge, insulators do not; a short circuit makes the current far larger than normal, which is dangerous.
modelTitle: Scope and limits of this model
modelText: The circuit is idealised: wires have tiny resistance (0.05 Ω for the shorting wire), the bulb is a constant 6 Ω (a real filament’s resistance grows as it heats), and the dots only show direction. Conductor and insulator is a rough sorting; damp wood can conduct.
linkAtom: → Atomic Structure: where free-moving charge in a conductor comes from
linkPart: → Particles & States: what matter is made of
linkEq: → Equations on a Balance: balance means both sides equal
:::

Page complete. {#done .readout .success i18n=text}

::: strings
parts: battery + switch + bulb + wires
s5ro: Look at the circuit and choose a diagnosis.
s5roOk: Correct: {why}
s5roNo: Look again: {why}
whyNormal: the loop is complete, the bulb is lit and current goes all the way round.
whySwitch: the switch is open, so the loop is broken at the switch.
whyCut: the switch is closed but a wire is cut, so the loop is incomplete.
whyShort: a wire shorts the bulb: it is dark but the current is large.
docTitle: Simple Circuits · Current Must Go Round
:::
