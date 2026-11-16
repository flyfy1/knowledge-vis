---
lang: en
---

::: strings
back: ← Knowledge Index
category: Earth & Space
stage: Primary
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Moon Phases · The Lit Half, Seen from Earth
tagline: Half the Moon is always lit by the Sun; how much of it we see each night depends on where it is on its orbit.
:::

## Does the Moon glow by itself? Which half is bright? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Always half lit
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: ALWAYS HALF LIT
:::

This step answers: which side of the Moon is lit? The Moon makes no light of its own; sunlight comes from the right and lights only the half facing the Sun. In this top-down view the Moon circles the Earth anticlockwise. Drag the “Moon position angle” (measured from the Sun’s direction; 0° means the Moon is between Earth and Sun): the lit half always faces the Sun. {#s0e .explain}

::: html step0-2
s0cv: Top view: Sun on the right, Moon circling Earth
th0: Moon position angle θ (degrees)
:::

::: strings
s0ro: θ = {th}°: the Moon’s lit half faces the Sun (right), wherever it is on the orbit; it is on the {side} of Earth.
sideNear: Sun side
sideFar: far side from the Sun
sideMid: side
:::

## From Earth, how much of the lit half do we see? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 View from Earth
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: VIEW FROM EARTH
:::

This step answers: why does the Moon change shape? The right panel shows the Moon’s disc as seen from the northern hemisphere. The Moon is always half lit, but from Earth we see only the part of the lit half that faces us: **illuminated fraction** = (1 − cos θ) ÷ 2. Drag θ and match the position on the left to the shape on the right. {#s1e .explain}

::: html step1-2
s1cv: Left: top-view position; right: the disc seen from Earth
th1: Moon position angle θ (degrees)
:::

::: strings
s1ro: θ = {th}°: {name}; illuminated fraction = (1 − cos {th}°) ÷ 2 = {pct}%.
:::

## In what order do the eight shapes come, and how many days per cycle? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 One month
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: ONE MONTH
:::

This step answers: what are the order and period of the phases? The Moon takes about 29.53 days to go once round relative to the Sun (a **synodic month**), about 12.2° per day. Press Play or drag the day: the eight small Moons below light up one by one, recording the phases already seen. {#s2e .explain}

::: html step2-2
s2cv: The Moon over one month, eight phases appearing in turn
play: Play
reset2: Reset to New Moon
day: Day (0–29.5)
:::

::: strings
pause: Pause
s2ro: Day {day}, θ = {th}°: {name}, {pct}% lit; {seen}/8 phases seen so far.
:::

## There is a new and a full Moon every month; why not an eclipse every month? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Why not every month
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: WHY NOT EVERY MONTH
:::

This step answers: why does the Moon often “miss” the Sun–Earth line at new Moon? The Moon’s orbit plane is tilted about 5° from Earth’s orbit plane. Drag the “orbit tilt i” and the “angle from the node ν”: at new or full Moon the Moon sits a height h = Earth–Moon distance × sin i × sin ν off the Sun–Earth line. Only if |h| is less than Earth’s radius plus the Moon’s radius (this page’s simplified test) can the Moon enter the shadow or cover the Sun. {#s3e .explain}

::: html step3-2
s3cv: Side view (distances to scale, bodies drawn 3× larger): the Moon’s height above the Sun–Earth line
inc: Orbit tilt i (degrees)
nu: Angle from the node ν (degrees)
:::

::: strings
s3ro: i = {i}°, ν = {nu}°: the Moon is h = {h} km off the line; limit {lim} km, so {res}.
resYes: an eclipse is possible
resNo: it misses; no eclipse
:::

## Why do we always see the same side of the Moon? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Same face
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: SAME FACE
:::

This step answers: how are the Moon’s spin and orbit related? The orange dot on the Moon’s surface is a “near-side marker”. Choose “Real: one spin per orbit” and the marker always points at Earth; choose “Suppose no spin”, drag θ, and the marker keeps a fixed direction and drifts away from Earth. The readout gives the angle between the marker direction and the Earth direction. {#s4e .explain}

::: html step4-2
s4cv: A marker on the Moon and the direction to Earth
spin: Real: one spin per orbit
nospin: Suppose: no spin
th4: Moon position angle θ (degrees)
:::

::: strings
s4ro: {mode}: θ = {th}°, the marker is {diff}° away from the Earth direction.
:::

## Where on the orbit is this phase from? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: from a phase, can you work out the Moon’s place on its orbit? The left disc is a phase (northern-hemisphere view). Drag “your guess θ” until the right disc matches, then press “Check”. {#s5e .explain}

::: html step5-2
s5cv: Left: the target phase; right: your guess
guess: Your guess θ (degrees)
check: Check
next: Another one
recapTitle: Recap
recap1: The Moon is always half lit, with the lit half facing the Sun.
recap2: A phase is the lit fraction we see from Earth: (1 − cos θ) ÷ 2, repeating about every 29.5 days.
recap3: The Moon’s orbit is slightly tilted, so not every new or full Moon brings an eclipse; its spin period equals its orbital period, so the same face always points at Earth.
modelTitle: Scope and limits of this model
modelText: The Moon’s orbit is treated as a circle, sunlight as parallel rays, and sizes and distances are not to scale (except in step 3). Phase names use the northern-hemisphere view; in the southern hemisphere left and right are swapped. The eclipse test is a rough geometric threshold; real conditions also depend on shadow size and changing distances.
linkDay: → Day & Night: Earth’s spin and its sunlit side
linkPin: → Pinhole Camera: light travelling in straight lines and shadows
:::

Page complete. {#done .readout .success i18n=text}

::: strings
ph0: New Moon
ph1: Waxing crescent
ph2: First quarter
ph3: Waxing gibbous
ph4: Full Moon
ph5: Waning gibbous
ph6: Last quarter
ph7: Waning crescent
s5roAsk: Adjust the right phase until it matches the left one.
s5roOk: Correct: the target θ = {tt}° ({name}); your {g}° is {d}° away.
s5roNo: Still {d}° off: look at which side is lit (right side lit means waxing, θ between 0° and 180°; left side lit means waning, θ between 180° and 360°).
docTitle: Moon Phases · The Lit Half, Seen from Earth
:::
