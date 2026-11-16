---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: The Circle · Compass, Radius and π
tagline: A compass sweeps out a circle; unroll its edge and it is always a little over 3 diameters long: that multiple is π.
:::

## What do all points on a circle have in common? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Compass
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: COMPASS
:::

This step answers: what kind of shape is a circle? The compass needle stays at the **centre**, and the opening between the legs is the **radius**. Set the radius, then drag “angle swept by the pen”: the pen leaves an arc behind it. The distance from the pen tip to the centre, measured on the picture, is the same at every position. {#s0e .explain}

::: html step0-2
s0cv: A compass drawing a circle, with the pen-to-centre distance
r0: Radius r (cm)
ang0: Angle swept by the pen (degrees)
:::

::: strings
s0ro: Radius {r} cm, pen swept {a}°: pen-to-centre distance = {dist} cm (computed point by point, always equal to the radius).
:::

## Which segment is the radius, the diameter, the chord? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Parts
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: PARTS
:::

This step answers: what kinds of segments live in a circle, and which is longest? A **radius** runs from the centre to a point on the circle; a **diameter** passes through the centre with both ends on the circle; a **chord** joins any two points on the circle. Drag the chord’s “span angle” and compare its length with the diameter. {#s1e .explain}

::: html step1-2
s1cv: A radius, a diameter and a chord
rr1: Radius r (cm)
chordAng: Chord span angle (degrees)
:::

::: strings
s1ro: Radius {r}, diameter = 2 × {r} = {d} cm; this chord is {c} cm, {cmp}.
cmpShort: {diff} cm shorter than the diameter
cmpEq: it is the diameter, the longest chord
:::

## Unroll the edge: how long is it? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One roll
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: ONE ROLL
:::

This step answers: how is one trip around the circle (the **circumference**) related to the diameter? A wheel rolls along a ruler without slipping: one full turn lays out a length equal to its circumference. Drag the number of turns, then compare the laid-out length with the diameter. {#s2e .explain}

::: html step2-2
s2cv: A wheel rolling along a ruler and the length it lays out
dd2: Wheel diameter d (cm)
turn2: Turns made
:::

::: strings
s2ro: Diameter {d} cm, {turn} turns, {len} cm rolled; one full turn lays out {c} cm, which is {ratio} times the diameter.
:::

## How many diameters is the circumference? Is it the same for big and small circles? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Where π comes from
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: WHERE π COMES FROM
:::

This step answers: is that multiple fixed, and what is it? Approximate the circle with a regular polygon: the more sides n, the closer its perimeter is to the circumference. The curve plots “polygon perimeter ÷ diameter” against the number of sides; it creeps toward one fixed number, **π** (≈ 3.14159). Changing the radius does not change this ratio. {#s3e .explain}

::: html step3-2
s3cv: Polygons approaching a circle, and perimeter ÷ diameter
n3: Polygon sides n
rr3: Radius r (cm)
:::

::: strings
s3ro: {n}-gon: perimeter {p} cm, diameter {d} cm, perimeter ÷ diameter = {ratio} (π ≈ {pi}, still {gap} short).
:::

## How do we find the area of a circle? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Area
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: AREA
:::

This step answers: why is the area π × r × r? Cut the circle into n sectors and place them alternately up and down: they form a near-rectangle whose length is half the circumference and whose height is the radius r. The finer the cut, the closer to a rectangle. Drag the number of sectors n and watch “length × height” approach π r². {#s4e .explain}

::: html step4-2
s4cv: A circle cut into sectors and rearranged into a near-rectangle
n4: Number of sectors n
rr4: Radius r (cm)
:::

::: strings
s4ro: {n} sectors: the near-rectangle is {w} cm long (≈ half the circumference) and {r} cm high, area ≈ {a} cm²; the circle’s area π × {r} × {r} = {a0} cm².
:::

## Know one quantity, find them all {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: given any one of radius, diameter, circumference or area, can you find the rest? Choose the known quantity and enter a value. The page uses d = 2r, C = π × d and A = π × r × r, with π as the computer’s exact value, rounded to two decimals. {#s5e .explain}

::: html step5-2
s5cv: The circle from your input
kind: Known quantity
kR: Radius r
kD: Diameter d
kC: Circumference C
kA: Area A
val: Value
recapTitle: Recap
recap1: A circle is the set of points at one distance from the centre; diameter = 2 × radius.
recap2: Circumference ÷ diameter = π (about 3.14159), whatever the circle’s size.
recap3: Area = π × radius × radius, from rearranging the circle into a near-rectangle.
modelTitle: Scope and limits of this model
modelText: This is an ideal plane circle: lines have no thickness and the wheel never slips. The π shown comes from polygon approximation; its decimals never end or repeat, and everyday work often uses 3.14.
linkAng: → Inscribed Angles: how angles on a circle relate to the centre angle
linkRot: → Symmetry & Rotation: why a circle matches itself after any turn
linkArea: → Multiplication as Area: how area is counted in squares
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Radius {r}, diameter {d}, circumference {c}, area {a} (lengths in cm, area in cm²).
docTitle: The Circle · Compass, Radius and π
:::
