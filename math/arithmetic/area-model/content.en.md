---
lang: en
---

::: strings
docTitle: Multiplication Is Area · One Interaction at a Time
back: ← Knowledge Index
pageTitle: Multiplication Is Area
tagline: Multiplication is not a chant to memorise — it is an area counted in unit squares: give a rectangle its rows and columns, and the total number of squares is the product. On this page the commutative law, the distributive law and two-digit vertical multiplication all turn out to be ways of turning or cutting one and the same plot of land.
foot: Multiplication Is Area · One Interaction at a Time
navLabel: Step navigation
:::

## Too many dots to count: multiplication is the shortcut {#step0 h2=s0t}

::: strings
nav0: 0 Too Many Dots
:::

Step 0 {#s0k .step-kicker i18n=text}

Question: what does the answer 24 in 4 × 6 actually count? This array is laid out in neat rows and columns — a **row** runs sideways, a **column** runs up and down — and the total is simply the number of dots. First change the rows and columns with the sliders (or drag on the canvas) and watch the formula in the readout; then press “Count them one by one” and count every dot, and compare with the total the formula gives. In this step there are only dots — nothing has grown into a surface yet. {#s0e .explain}

::: html step0-1
canvasLabel: Interactive diagram for this step; instructions appear above
s0rowLab: Rows (sideways)
s0colLab: Columns (up and down)
s0countBtn: Count them one by one
reset: Reset this step
:::

::: strings
s0ro: An array of {r} {rw} × {c} {cw}: the formula gives the total at a glance, {r} × {c} = {n}.
s0counting: Counting one by one: {k} / {n} so far…
s0countDone: Finished — {n} {tw} in all, exactly the formula's {r} × {c} = {n}. Counting one by one is slow; the formula answers at a glance. Multiplication is the shortcut for counting a total — as long as the dots form neat rows and columns with the same number in every row.
:::

## Dots become land: multiplication is area {#step1 h2=s1t}

::: strings
nav1: 1 Dots Become Area
:::

Step 1 {#s1k .step-kicker i18n=text}

Question: once the dots grow into a surface, what is multiplication measuring? Stretch every dot into a small square and the array becomes a rectangular plot of land. Its **area** is how many unit squares the plot covers; one square counts as 1 square unit. Move the sliders for length a and width b and watch the area readout S = a × b follow; then press “Turn it around” to rotate the whole plot by 90° — keep your eyes on the total number of squares and see whether it changes. {#s1e .explain}

::: html step1-1
s1aLab: Length a (horizontal side, in squares)
s1bLab: Width b (vertical side, in squares)
s1rotBtn: Turn it around (rotate 90°)
:::

::: strings
s1ro: a = {a}, b = {b} → area S = a × b = {a} × {b} = {s} (unit: squares).
s1roRot: Turned around: a and b have swapped to {a} × {b}, and the area is still {s} {sq} — the same plot, not one square more or less. That is the commutative law: a × b = b × a. Nobody decreed it; it is one plot seen from two directions.
:::

## One cut: split a hard product into two easy plots {#step2 h2=s2t}

::: strings
nav2: 2 One Cut
:::

Step 2 {#s2k .step-kicker i18n=text}

Question: how do you work out a product like 13 × 7 quickly and correctly? The whole plot is 13 columns × 7 rows. Drag the vertical cut line on the canvas (or use the slider) to split the land into a left and a right plot, count each plot's area, and add them. Watch three numbers — left, right, total: wherever the cut goes, the total must not change. This “cut, compute separately, then add” method is the **distributive law**: cut at 10, it reads (10 + 3) × 7 = 10 × 7 + 3 × 7. {#s2e .explain}

Watch the total first, then move the cut: the left block grows, the right shrinks, and their sum returns to the same whole area. {#s2bridge .hint i18n=text}

::: html step2-1
s2cutLab: Cut position (after which column)
s2leftT: Left plot
s2rightT: Right plot
:::

::: strings
s2leftRO: {w} {cw} × 7 rows = {v} squares
s2rightRO: {w} {cw} × 7 rows = {v} squares
s2total: Add the two plots: {l} + {r} = {sum}; the whole plot at once: 13 × 7 = {sum}. Drag the cut anywhere — the total never changes.
s2best: The cut is now at the round ten (after column 10): 10 × 7 = 70 is obvious at a glance — any cut is correct, but cutting out a round ten is the easiest to compute.
:::

## Two digits × two digits: one plot in four pieces {#step3 h2=s3t}

::: strings
nav3: 3 Four Plots
:::

Step 3 {#s3k .step-kicker i18n=text}

Question: why does the vertical algorithm for 12 × 13 give the right answer? Split 12 into 10 + 2 and 13 into 10 + 3 (a round ten plus a remainder), cut once vertically and once horizontally, and the land falls into four plots. The cuts sit at 10 because the round-ten part is the easiest to compute. Press “Light up the plots one by one” and read each area; then compare with the vertical ledger — **vertical multiplication** is just the written, step-by-step algorithm, and every step of it computes one or a few of these plots. {#s3e .explain}

Read the four blocks first — 10×10, 10×3, 2×10, 2×3 — then add them; each written row is part of that area ledger. {#s3bridge .hint i18n=text}

::: html step3-1
s3aLab: First number (plot width)
s3bLab: Second number (plot height)
s3lightBtn: Light up the plots one by one
:::

::: strings
s3roIdle: {m} = 10 + {a2} and {n} = 10 + {b2}: one vertical and one horizontal cut — four plots are waiting to be lit.
s3roLit: Lit {k} / 4 plots · running total of lit area: {sum} squares.
s3roDone: The four areas: {p1} + {p2} + {p3} + {p4} = {sum}. So {m} × {n} = {sum}.
s3vert: Match the vertical algorithm: the ones digit of {n} is {b2}, and {m} × {b2} = {g1} (the bottom two plots, {pb1} + {pb2}); the tens digit of {n} is 1, and {m} × 10 = {g2} (the top two plots, {pt1} + {pt2}); {g1} + {g2} = {sum}. Vertical multiplication is no ritual — every step computes the area of a plot.
:::

## Backwards: given the area, find the sides {#step4 h2=s4t}

::: strings
nav4: 4 From Area to Sides
:::

Step 4 {#s4k .step-kicker i18n=text}

Question: if all you are told is that the area is 24, what could the length and width be? Drag the “try a side” slider to test widths from 1 to 12; the canvas tries to tile a rectangle of area 24 with that width. If it tiles exactly, you have found an answer; if it cannot (the last row is left with gaps), that width is ruled out. There are only four integer answers — try to collect them all. Two side lengths whose product is exactly 24 always show up as a pair: a **factor pair**. {#s4e .explain}

Try one width: an exact tiling of 24 unit squares gives a factor pair; gaps rule that width out. {#s4bridge .hint i18n=text}

::: html step4-1
s4wLab: Try a side: width w
s4qT: Quiz: 14 × 6 = ?
:::

Don't reach for the vertical algorithm yet: cut 14 into 10 + 4, giving two plots, 10 × 6 and 4 × 6 (the vertical line in the picture cuts at 10). Pick an answer first, then press “Reveal the working” — the working is shown only if you are right. {#s4qE .explain}

::: html step4-2
s4reveal: Reveal the working
s4fin: This whole page has made one point: the answer to a multiplication is the area of a rectangular plot, counted in squares. The commutative law is the same plot turned around, the distributive law is the same plot cut apart, and vertical multiplication is the four plots computed in an orderly queue. Take the plot with you and keep going:
lkFrac: The whole and its parts: on the fractions page, see how one whole is cut into equal parts and some of them are taken →
lkPyth: Area can also prove things: step 2 of the Pythagoras page counts one big square in two ways to prove a² + b² = c² →
:::

::: strings
s4roFound: Width {w}, height {h}: it tiles exactly, {w} × {h} = 24 ✓ A factor pair: {pair}.
s4roAgain: Width {w}, height {h} also tiles — but this pair, {pair}, is one you already found, just with the plot turned around. It is already recorded.
s4roMiss: Width {w}: {w} squares per row, and {full} full rows use {used} squares. {rem} squares are left over — {gap} short of completing the last row — so they cannot form a tidy rectangle, and {w} is not a factor of 24.
s4prog: Factor pairs collected: {k} / 4.
s4done: All four pairs collected! A rectangle of area 24 with integer sides comes in only four shapes: 1×24, 2×12, 3×8, 4×6. Two numbers whose product is 24 are factors of each other — factors always arrive in pairs, one as the width and one as the height.
s4qIdle: No answer picked yet: choose a number first, then reveal.
s4qWrong: Not yet. Hint: 10 × 6 = 60 and 4 × 6 = 24 — what do the two plots add up to? Pick another answer and try again.
s4qRight: Correct! The working: 14 × 6 = 10 × 6 + 4 × 6 = 60 + 24 = 84. This is exactly the distributive law from Step 2's single cut — any cut works, and cutting out a round ten is the easiest.
:::
