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
pageTitle: Intervals & Fences · Gaps and Posts Differ by One
tagline: Planting trees, sawing logs, climbing stairs: counting “points” and counting “gaps” differ by one, and checking the ends tells you which way.
:::

## Between n points, how many gaps? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Count the gaps
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: COUNT THE GAPS
:::

This step answers: if n points sit in a row, how many gaps (a gap is the space between two neighbouring points) are there? Drag the slider to change n: orange marks are points, cyan brackets are the gaps between neighbours. Count them: is there one more point than gaps? {#s0e .explain}

::: html step0-2
s0cv: A row of points and the gaps between them
pts: Number of points n
:::

::: strings
s0ro: {n} points in a row make {g} gaps (counted pair by pair): gaps = points − 1.
:::

## A 24 m road with trees at equal spacing and both ends planted: how many trees? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Both ends
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: BOTH ENDS
:::

This step answers: with both ends planted, how do the number of trees and the number of gaps compare? The road is fixed at 24 m; drag the spacing slider. **Spacing** is the distance between neighbouring trees, and each spacing makes one gap. Numbers mark each tree; the cyan runs mark each gap. {#s1e .explain}

::: html step1-2
s1cv: A 24 m road with trees at both ends
gap: Spacing (m)
:::

::: strings
s1ro: Spacing {d} m: 24 ÷ {d} = {seg} gaps; both ends planted, so trees = gaps + 1 = {trees} (counted {counted} on the drawing).
:::

## What if one end, or neither end, is planted, or the road is a loop? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Other ends
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: OTHER ENDS
:::

This step answers: how does planting or skipping the ends change the tree count? Pick a way to plant and set the spacing with the slider. Each end of the road is a point: both ends planted, trees = gaps + 1; one end only, trees = gaps; neither end, trees = gaps − 1; a loop that closes on itself, trees = gaps. Watch which tree disappears in each picture. {#s2e .explain}

::: html step2-2
s2cv: Four ways to plant: both ends, one end, neither end, loop
modeLabel: Choose how to plant
mBoth: Both ends
mOne: One end only
mNone: Neither end
mRing: A closed loop
:::

::: strings
s2ro: {mode}, spacing {d} m: {seg} gaps and {trees} trees (counted {counted} on the drawing); trees − gaps = {diff}.
:::

## To saw a log into k pieces, how many cuts? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Sawing
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: SAWING
:::

This step answers: how many cuts and how much time does a number of pieces need? Each press of “Make a cut” adds one cut mark; assume 3 minutes per cut. A cut is a “point” and a piece is a “gap”: cuts = pieces − 1. {#s3e .explain}

::: html step3-2
s3cv: A log cut into pieces
saw: Make a cut
reset3: Put back one whole log
:::

::: strings
s3ro: {c} cuts so far, giving {p} pieces; {time} minutes in all (not {p} × 3 = {wrong}).
s3roFull: {c} cuts so far, giving {p} pieces; {time} minutes in all (not {p} × 3 = {wrong}). The picture stops at 9 cuts.
:::

## Floor 1 to floor a takes 30 s: how long to floor b? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Stairs
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: STAIRS
:::

This step answers: how do floors and flights of stairs differ in number? Floors are the points and each flight between two floors is a gap: going from floor 1 to floor a means a − 1 flights. We know floor 1 to floor a takes 30 s, so we find the time per flight and then the time to floor b. {#s4e .explain}

::: html step4-2
s4cv: Floors of a building and the flights between them
fa: Known: floor 1 to floor (a)
fb: Asked: floor 1 to floor (b)
:::

::: strings
s4ro: Floor 1 to {a} is {fa} flights in 30 s, {per} s each; floor 1 to {b} is {fb} flights, {t} s (not 30 × {b} ÷ {a} = {wrong} s).
:::

## Backwards: from the tree count, how long is the road? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: given the number of trees and the spacing, can we work out the length? Choose how to plant, enter the number of trees T and the spacing d (m): the tree count gives the number of gaps, and gaps times spacing gives the length. {#s5e .explain}

::: html step5-2
s5cv: The road from your input
treesIn: Number of trees T
dIn: Spacing d (m)
recapTitle: Recap
recap1: Points minus gaps is 1, 0 or −1, depending on whether the ends are planted.
recap2: Count gaps first (length ÷ spacing), then add or subtract 1 for the ends.
recap3: Cuts in a log and flights in a staircase are also “gaps between neighbouring points”.
modelTitle: Scope and limits of this model
modelText: We assume equal spacing, trees as points with no width, a straight road (a loop is one full circle). If the spacing does not divide the length exactly, this counting does not apply directly.
linkPat: → Patterns: how “one more point than gaps” turns into a formula
linkDiv: → Division & Remainder: what happens when the length does not divide evenly
linkEq: → Equations on a Balance: using equal quantities to find the unknown
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: {mode}, {T} trees, spacing {d} m: gaps = {seg}, length = {seg} × {d} = {len} m.
s5roBad: This way of planting needs at least {min} trees.
docTitle: Intervals & Fences · Gaps and Posts Differ by One
:::
