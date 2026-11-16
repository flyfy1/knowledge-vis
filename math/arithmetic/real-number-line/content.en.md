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
pageTitle: Real Numbers & the Number Line · Where √2 Lands
tagline: Swing the diagonal of a unit square onto the number line and √2 lands at one definite point; it cannot be written as a fraction, yet we can close in on it forever.
:::

## A square with side 1: how long is its diagonal? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Diagonal lands
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: DIAGONAL LANDS
:::

This step answers: where is √2 on the number line? In a square of side 1, the diagonal squared = 1² + 1² = 2 (Pythagoras), so the diagonal is √2 long. Drag the rotation angle: the diagonal swings about the origin onto the number line, and where its tip lands is where √2 sits. {#s0e .explain}

::: html step0-2
s0cv: The diagonal swung about the origin onto the number line
rot: Rotation angle (degrees, 45 → 0)
:::

::: strings
s0ro: The diagonal is {d} long (= √(1² + 1²)); at {a}° its tip is at ({x}, {y}), and on the axis x = {d}.
:::

## Can √2 be written as a ratio p/q of whole numbers? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Not a fraction
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: NOT A FRACTION
:::

This step answers: is there a fraction exactly equal to √2? A **fraction** is p/q with p and q whole numbers, q ≠ 0. Set a largest denominator N: for each denominator q find the closest p/q and keep the smallest error. Drag N: the error keeps shrinking but never reaches 0; the page also computes p² − 2q², which would have to be 0 for p/q to equal √2, yet its absolute value is always at least 1. {#s1e .explain}

::: html step1-2
s1cv: The closest fraction to √2 with denominator up to N, and its error
NN: Largest denominator N
:::

This is an observation, not a proof; the classic proof uses parity: if p² = 2q² then p and q are both even, which contradicts having cancelled common factors. {#s1note .note i18n=text}

::: strings
s1ro: N = {N}: closest fraction {p}/{q} = {v}, off by {err}; among q ≤ {N} the smallest |p² − 2q²| is {m} (never 0).
:::

## Written as a decimal, does √2 stop or repeat? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Endless decimal
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: ENDLESS DECIMAL
:::

This step answers: how do different numbers differ as decimals? 1/4 = 0.25 stops; 1/3 = 0.333… repeats forever; √2 = 1.41421356… neither stops nor repeats, and such a number is called **irrational**. Pick a number and drag the number of decimal places k: each time the number line zooms in one digit, and the interval trapping the number shrinks to length 10 to the power −k. {#s2e .explain}

::: html step2-2
s2cv: Zooming in digit by digit: the interval that traps the number
which: Choose a number
w2: √2
w3: 1/3
w4: 1/4
kd: Decimal places k
:::

::: strings
s2ro: First {k} decimal places of {name}: {digits}; the interval trapping it is [{lo}, {hi}], of length 10⁻{k}.
:::

## How do we squeeze out √2 by comparing sizes? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Bisection
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: BISECTION
:::

This step answers: without a square-root button, how do we get an approximation of √2? We know 1² = 1 < 2 < 2² = 4, so √2 is between 1 and 2. Each time take the midpoint m: if m² < 2, √2 is to the right of m, so the left end moves to m; otherwise the right end moves to m. Press “Bisect once”: the interval halves each time, and the rows pile up in the picture. {#s3e .explain}

::: html step3-2
s3cv: Each row is the interval after one more bisection
bis: Bisect once
bis10: Bisect 10 times
resetB: Reset the interval [1, 2]
:::

::: strings
s3ro: {k} bisections: interval [{lo}, {hi}], width {w}; the midpoint just used {m}, {m}² = {m2}, which is {cmp} 2.
s3roStart: Interval [1, 2], width 1; press “Bisect once” to begin.
lt: less than
ge: not less than
:::

## How do we draw √3, √5, √6 … one after another? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Root spiral
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: ROOT SPIRAL
:::

This step answers: can other square roots be drawn in the plane too? Start with a segment of length 1; at its end add a perpendicular segment of length 1: by Pythagoras the hypotenuses come out as √2, √3, √4 … Drag the number of triangles n: hypotenuses that are exactly whole numbers (like √4 = 2) are green; the others are irrational and cannot be written as fractions. {#s4e .explain}

::: html step4-2
s4cv: A spiral of right triangles whose hypotenuses are √k
nT: Number of triangles n
:::

::: strings
s4ro: Hypotenuse {n} = √{k} = {v}; among the first {n}, {c} are whole numbers.
:::

## For any whole number n, is √n a whole number, a fraction or irrational? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how do we tell what kind of number √n is? If n is a perfect square (1, 4, 9, 16 …), √n is a whole number; otherwise √n is always irrational (not a fraction). Enter n: the page computes the decimal expansion of √n and places it on the number line. {#s5e .explain}

::: html step5-2
s5cv: Where √n sits on the number line
nIn: Whole number n (1–200)
recapTitle: Recap
recap1: √2 is the diagonal of a unit square and has a definite place on the number line.
recap2: √2 is not a fraction and its decimals neither stop nor repeat, yet methods like bisection close in on it without end.
recap3: The square root of a whole number is either whole or irrational; rationals and irrationals together fill the whole line, and are called the real numbers.
modelTitle: Scope and limits of this model
modelText: The decimal digits here come from exact integer arithmetic (not floating-point approximations); the “not a fraction” part is an observation, with the classic proof sketched in one line. The number-line drawings are schematic; positions only separate when you zoom in.
linkPyth: → Pythagorean Theorem: why the diagonal squared is 2
linkNeg: → Negative Numbers: extending the number line to the left
linkCoord: → Coordinate Plane: positions of points in the plane
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: √{n} = {digits}…; {kind}.
kInt: it is the whole number {r} ({n} is a perfect square)
kIrr: it is irrational ({n} is not a perfect square)
docTitle: Real Numbers & the Number Line · Where √2 Lands
:::
