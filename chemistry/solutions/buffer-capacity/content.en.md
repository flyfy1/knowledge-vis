---
lang: en
---

::: strings
docTitle: Buffer Solutions · Resist Acid–Base Pushes
back: ← Knowledge Index
pageTitle: Buffer Solutions · Resist Acid–Base Pushes
tagline: A weak acid and its conjugate base work together: neutralize an incoming push first, then let pH move a little.
navLabel: Step navigation
foot: Buffer Solutions · Resist Acid–Base Pushes
acid: acid
base: base
:::

## Watch who catches the incoming H⁺ / OH⁻ {#step0 h2=s0t}

::: strings
nav0: 0 See resistance
:::

STEP 0 · DYNAMIC BUFFER {#s0k .step-kicker i18n=text}

A buffer contains **HA ⇌ H⁺ + A⁻**. Add acid and A⁻ catches H⁺ to become HA; add base and HA gives up H⁺. Each button adds 0.01 mol/L—watch pH and the two inventories change. {#s0e .explain}

::: html step0-1
canvasLabel: Buffer particle and pH visual
addAcid: Add acid H⁺
addBase: Add base OH⁻
reset: Reset this step
:::

::: strings
s0ro: pH {pH} · HA {ha}% · A⁻ {a}% · acid neutralized {acid} · base neutralized {base}
s0acid: A⁻ catches the acid; pH moves a little.
s0base: HA catches the base; pH moves a little.
:::

## pH reads a ratio, not “how strong” the acid is {#step1 h2=s1t}

::: strings
nav1: 1 Ratio sets pH
:::

STEP 1 · HENDERSON–HASSELBALCH {#s1k .step-kicker i18n=text}

At fixed temperature, **pH = pKa + log([A⁻]/[HA])**. pKa is the acid identity; the ratio sets the current pH. Move both controls and see what changes. {#s1e .explain}

::: html step1-1
pKaLab: pKa
ratioLab: [A⁻]/[HA] ratio
:::

::: strings
s1ro: pH {pH} · pKa {pka} · A⁻/HA = {ratio} · HA {ha}% / A⁻ {a}%
s1feedback: Misconception check: dilution changes HA and A⁻ together, so an unchanged ratio leaves pH nearly unchanged; it mainly changes how much outside acid/base the buffer can absorb.
:::

## The buffer region is flat, not frozen {#step2 h2=s2t}

::: strings
nav2: 2 Add acid/base
:::

STEP 2 · TITRATION CURVE {#s2k .step-kicker i18n=text}

Add strong acid or base along the x-axis and compare a buffer with pure water at the same starting pH. The curves come from neutralization and equilibrium at each equivalent: a buffer delays the steep pH jump, but too much input still exhausts it. {#s2e .explain}

::: html step2-1
curveLabel: Buffer and water titration curves
acidLab: cumulative acid (mol/L)
baseLab: cumulative base (mol/L)
:::

::: strings
s2ro: net added equivalents {net} · buffer pH {buffer} · pure-water estimate {water}
s2feedback: Misconception check: a buffer does not lock pH forever; once HA or A⁻ is nearly exhausted, the curve leaves the buffer region and steepens.
:::

## Same ratio, higher concentration can take a bigger push {#step3 h2=s3t}

::: strings
nav3: 3 Capacity is inventory
:::

STEP 3 · BUFFER CAPACITY {#s3k .step-kicker i18n=text}

Move total concentration C. Both cups have the same pKa and starting ratio, so their initial pH matches; the concentrated cup has more HA/A⁻ inventory, so the same push changes pH less. {#s3e .explain}

::: html step3-1
capacityLabel: Buffer-capacity comparison
concLab: total buffer concentration C (mol/L)
:::

::: strings
s3ro: C = {c} mol/L · pH after {dose} mol/L acid {pH} · initial pH {initial} · ΔpH {delta}
s3feedback: Misconception check: capacity is not the pH number; it is the inventory that keeps pH from moving when acid/base arrives.
:::

## Separate three ideas and buffers make sense {#step4 h2=s4t}

::: strings
nav4: 4 Wrap-up
:::

STEP 4 · WRAP-UP {#s4k .step-kicker i18n=text}

The **ratio** sets current pH; **pKa** describes the acid identity; **total concentration** sets how much outside acid/base can be neutralized. Buffering is strongest near pH ≈ pKa, when both HA and A⁻ have useful inventory. {#s4e .explain}

::: html step4-1
modelTitle: Model assumptions
modelBody: This lesson uses ideal concentrations, fixed temperature, and the Henderson–Hasselbalch approximation. It omits activities, water autoionization, and volume change; real titrations require full equilibrium and volume corrections.
linkAcid: → Acid–base equilibrium: Ka, dilution, and common ion
linkEq: → Chemical equilibrium: the new balance after a push
:::
