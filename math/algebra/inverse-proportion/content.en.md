---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Inverse Proportion · One Up, One Down
tagline: A rectangle of fixed area gets shorter as it gets longer; two quantities with a constant product graph as a hyperbola that never touches the axes.
:::

## A rectangle of area 12: as the length grows, what happens to the width? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Fixed area
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: FIXED AREA
:::

This step answers: when two quantities have a fixed product, what happens to one as the other grows? A rectangle’s **area** = length × width, and here it is fixed at 12. Drag the length: the width is worked out as 12 ÷ length, so a longer rectangle is lower, and the area stays at 12 squares. {#s0e .explain}

::: html step0-2
s0cv: A rectangle of fixed area: the length changes and the width follows
len0: Length L
:::

::: strings
s0ro: Length {L}, width = 12 ÷ {L} = {W}; area {L} × {W} = {A}, always 12.
:::

## If the length becomes m times as long, what happens to the width? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 One up, one down
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: ONE UP, ONE DOWN
:::

This step answers: if one quantity grows several times, what happens to the other? Start with length 2, width 6, area 12. Drag the multiplier m to multiply the length by m: since the area is fixed, the width must be divided by m. The orange bar is the length and the cyan bar the width; one grows while the other shrinks, and the product stays 12. {#s1e .explain}

::: html step1-2
s1cv: Multiply the length by m and the width is divided by m
mm: Multiplier m for the length
:::

::: strings
s1ro: Length 2 × {m} = {L}, width 6 ÷ {m} = {W}, product {L} × {W} = {A}.
:::

## Plot every (x, y): what shape is it? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Hyperbola
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: HYPERBOLA
:::

This step answers: what does a fixed-product relation look like on a graph? An inverse proportion is y = k ÷ x (k is a nonzero constant; here positive). The orange point’s x and y are the rectangle’s length and width, and the shaded rectangle has area k. Drag x: the point slides along the curve, the shaded shape changes but its area does not; the curve hugs the axes ever closer without touching them. {#s2e .explain}

::: html step2-2
s2cv: The curve y = k/x and the shaded rectangle (area k)
kk: Constant k (the product)
xx: Value of x
:::

::: strings
s2ro: k = {k}, x = {x}: y = {k} ÷ {x} = {y}; shaded area x × y = {A}.
s2roOff: (y is beyond 10, the top of the graph, so the point is off the picture.)
:::

## How do we tell inverse from direct proportion at a glance? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Versus direct
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: VERSUS DIRECT
:::

This step answers: how can we tell whether two quantities are directly or inversely proportional? In the direct case y = 2x, y ÷ x is always 2 (the **ratio** is constant); in the inverse case y = 12 ÷ x, x × y is always 12 (the **product** is constant). The four bar groups below compute the ratio and the product at x = 1 to 6: the flat one tells you the relationship. {#s3e .explain}

::: html step3-2
s3cv: Direct and inverse proportion: ratio and product
tx: Pick an x
:::

::: strings
s3ro: x = {x}: direct y = {yd}, ratio {rd}, product {pd}; inverse y = {yi}, ratio {ri}, product {pi}.
dirRatio: Direct: y ÷ x
dirProd: Direct: x × y
invRatio: Inverse: y ÷ x
invProd: Inverse: x × y
:::

## With a fixed distance, are speed and time inversely proportional? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 In real life
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: IN REAL LIFE
:::

This step answers: which real quantities are inversely proportional? Whenever a “total” is fixed, the product of the two quantities is that total: for a 120 km trip, speed × time = 120; for a job of 60 person-days, people × days = 60. Choose a situation, drag the value, and watch the point on the curve. {#s4e .explain}

::: html step4-2
s4cv: The inverse-proportion curve of a real situation
scTrip: A 120 km trip
scWork: A 60 person-day job
val4: Value
:::

This holds only while the total is fixed: real roads have traffic and larger crews need coordinating, so reality is not exactly inverse. {#s4note .note i18n=text}

::: strings
s4roTrip: At {v} km/h it takes {t} hours; speed × time = {p} (km).
s4roWork: With {v} people it takes {t} days; people × days = {p} (person-days).
:::

## Given one point, find another {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: knowing y is inversely proportional to x and one point, how do we find other points? Use the known point to get k = x × y, then y = k ÷ x. Each question gives a point (x₀, y₀) and asks for y at x = x₁. {#s5e .explain}

::: html step5-2
s5cv: The inverse curve through the given point
ans: Your answer y
check: Check
nextQ: Another question
recapTitle: Recap
recap1: Fixed product: when one grows several times, the other shrinks by the same factor.
recap2: The graph is the hyperbola y = k ÷ x, which never meets the axes.
recap3: Test: x × y constant means inverse; y ÷ x constant means direct.
modelTitle: Scope and limits of this model
modelText: We use the branch with k > 0 and x > 0; for k < 0 the curve lies in the other two quadrants. In real life an inverse relation holds only while the total is fixed; not every “one up, one down” is strictly inverse.
linkArea: → Multiplication as Area: area = length × width, counted in squares
linkLin: → Linear Functions: another kind of change, the same amount each step
linkPar: → Quadratic Functions & the Parabola: a third common function graph
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5roAsk: Given ({x0}, {y0}), find y at x = {x1}. Start with k = {x0} × {y0}.
s5roOk: Correct: k = {k}, y = {k} ÷ {x1} = {y1}.
s5roNo: Not right: k = {x0} × {y0} = {k}, so y = {k} ÷ {x1} = {y1}. You entered {g}.
docTitle: Inverse Proportion · One Up, One Down
:::
