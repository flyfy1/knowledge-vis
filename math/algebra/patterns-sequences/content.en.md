---
lang: en
---

::: strings
docTitle: Patterns · Name the 100th Without Drawing It
back: ← Knowledge Index
pageTitle: Patterns · Name the 100th Without Drawing It
tagline: Build shapes from matchsticks: count the first few, find how many are added each time, then compute any figure n directly.
navLabel: Step navigation
category: Mathematical Foundations
stage: Primary
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
langLabel: Language
:::

## How many sticks does figure n need? {#step0 h2=s0t}

::: strings
nav0: 0 Count
:::

STEP 0 · COUNT {#s0k .step-kicker i18n=text}

This step answers: if n squares are lined up in a row, how many matchsticks are used? “Figure n” means the row of n squares, where neighbouring squares share the stick between them. Drag the slider to change n, then press “Count stick by stick” and watch the tally grow. {#s0e .explain}

::: html step0-1
s0cv: A row of squares made of matchsticks
s0n: Number of squares n
s0count: Count stick by stick
s0reset: Reset count
:::

::: strings
s0ro: Figure {n}: {total} sticks in all (counted from the segments drawn).
s0roCount: Counting: {k} of {total} sticks so far
s0roDone: Done counting: {total} sticks.
:::

## Each new square costs how many sticks? {#step1 h2=s1t}

::: strings
nav1: 1 Find the step
:::

STEP 1 · FIND THE STEP {#s1k .step-kicker i18n=text}

This step answers: compared with the previous figure, how many more sticks are there? That extra amount is the **step** (this figure’s total minus the previous figure’s total). Press “Add another square”; the orange sticks are the new ones, and the sequence above records every total and every step. {#s1e .explain}

::: html step1-1
s1cv: Squares added one at a time, with totals and steps recorded
s1add: Add another square
s1reset: Reset to figure 1
:::

::: strings
s1ro: Now figure {n}: {total} sticks; {d} new this time ({total} − {prev}).
s1ro1: Figure 1: 4 sticks. There is no earlier figure to compare with yet, so add another.
s1roSame: The step stays {d}: each new piece has the same shape, so it always adds the same number.
:::

## How can we get figure 100 without drawing it? {#step2 h2=s2t}

::: strings
nav2: 2 Group
:::

STEP 2 · GROUP {#s2k .step-kicker i18n=text}

This step answers: can we skip the drawing and compute the total for figure n? Read the colours: the one grey stick on the far left is the “starter”; every square then brings 3 new sticks of its own colour (top, right, bottom). So total = 1 + 3 × n. Drag n, or type a large n into the box and only calculate. {#s2e .explain}

::: html step2-1
s2cv: Sticks coloured as “1 starter + 3 per square”
s2n: Number of squares n
s2big: Try a big n (calculate only)
:::

::: strings
s2ro: Figure {n}: 1 + 3 × {n} = {total} sticks.
s2roBig: n = {n}: 1 + 3 × {n} = {total} sticks; matches the stick-by-stick construction count {check}.
s2roMore: (Only the first {shown} squares are drawn; the dots stand for the rest.)
:::

## With triangles or hexagons, does the same method work? {#step3 h2=s3t}

::: strings
nav3: 3 Other shapes
:::

STEP 3 · OTHER SHAPES {#s3k .step-kicker i18n=text}

This step answers: what decides “how many more each time”? Pick a chain of shapes in which neighbours share one side. In the chart below, the x-axis is n, the y-axis is the total number of sticks, and each dot is a real count. If the dots fall on a straight line, the step is constant; that constant is the height of each stair. {#s3e .explain i18n=text}

::: html step3-1
s3kind: Choose a shape
kSq: Squares
kTri: Triangles
kHex: Hexagons
s3cv: A chain of shapes and a chart of stick totals
s3n: Number of shapes n
:::

::: strings
axisN: n shapes
axisSticks: sticks
s3ro: {kind} chain: figure {n} uses {total} sticks; the step is always {d} and the starter is 1, so total = {d} × n + 1.
:::

## What if the number added changes every time? {#step4 h2=s4t}

::: strings
nav4: 4 Growing steps
:::

STEP 4 · GROWING STEPS {#s4k .step-kicker i18n=text}

This step answers: when the step is not constant, do the totals still form a line? Below is a staircase of dots: row 1 has 1 dot, row 2 has 2 dots, and so on, so each new row adds one more dot than the last. Drag the number of rows n and read the totals, the steps, and the bars that grow faster and faster. {#s4e .explain i18n=text}

::: html step4-1
s4cv: Dot staircase with totals and steps
s4n: Number of rows n
:::

::: strings
s4ro: {n} rows hold {total} dots; the row just added (row {n}) has {d}. The steps {list} each grow by 1, so they are not constant.
s4roLine: The totals climb faster and faster, so they no longer sit on a line. A pattern is still there: two staircases fit together into n(n+1)/2.
:::

## A pattern = a start + the amount added each time {#step5 h2=s5t}

::: strings
nav5: 5 Wrap-up
:::

STEP 5 · WRAP-UP {#s5k .step-kicker i18n=text}

This step answers: once you know the rule, can you run it backwards? Enter a total number of sticks S; the page uses the squares-chain rule S = 3n + 1 to find n and checks whether it is a whole number. {#s5e .explain i18n=text}

::: html step5-1
s5in: Total sticks S
recapTitle: Recap
recap1: Count the first few figures and work out the step between neighbouring totals.
recap2: If the step is constant, total = step × n + starter; if the step keeps growing, the totals climb faster and faster.
recap3: A formula only counts as the rule when its numbers match real, drawn counts.
modelTitle: Scope and limits of this model
modelText: The rule here holds only for the layout we fixed: one row of shapes, neighbours sharing exactly one side. Another layout (say, two rows) has a different rule, and a pattern read off the first few terms stays a conjecture until it is checked further.
linkLin: → Linear Functions: why a constant step puts points on a straight line
linkArea: → Multiplication as Area: split a hard block into two easy ones
linkEq: → Equations on a Balance: how to solve backwards from a known total to n
:::

Page complete: you can count, find the step, state the rule and run it backwards. {#done .readout .success i18n=text}

::: strings
s5roLow: S = {s}: even one square needs 4 sticks, so S must be at least 4.
s5roOk: S = {s}: 3n + 1 = {s}, so n = {n}. Figure {n} uses exactly {s} sticks.
s5roNo: S = {s}: no chain of squares uses exactly {s} sticks ((S − 1) ÷ 3 = {q} is not a whole number).
:::
