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
pageTitle: Bar Charts · Numbers Standing in a Row
tagline: A row of bars turns numbers into lengths: see who is taller, and watch the average line balance the highs against the lows.
:::

## How does a number become a bar? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Numbers to bars
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: NUMBERS TO BARS
:::

This step answers: what does a bar’s height mean? Here are the heights of 8 students (in centimetres). The height of a bar is exactly that value: pick a student and drag their height, and only that bar grows or shrinks while the others stay put. {#s0e .explain}

::: html step0-2
s0cv: Bar chart of 8 students’ heights
who: Choose student #
hgt: Their height (cm)
:::

::: strings
unit: cm
s0ro: Student #{i} is {v} cm, and the bar height equals that value; of the 8, the tallest is {max} and the shortest is {min} (cm).
:::

## Who is taller than whom, and by how much? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Compare
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: COMPARE
:::

This step answers: how far apart are two bars? Choose student A and student B: dashed lines level across from each bar top, and the bracket between them is the difference in height. The tallest bar is green, the shortest violet. {#s1e .explain}

::: html step1-2
s1cv: Comparing the gap between two bars
A: Student A #
B: Student B #
:::

::: strings
s1ro: A (#{a}) is {va} cm, B (#{b}) is {vb} cm: difference = {va} − {vb} = {d} cm.
s1roSame: A and B are the same student, so the difference is 0.
:::

## Why can the same data look wildly different? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Axis start
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: AXIS START
:::

This step answers: what does the start of the vertical axis (the baseline) change? The data never changes; only the number where the axis starts does. A bar’s drawn length is “value − baseline”, so raising the baseline makes the tallest bar look many times the shortest, while the real heights stay close. {#s2e .explain}

::: html step2-2
s2cv: The same data with different axis starts
base: Axis start (cm)
:::

::: strings
s2ro: Start {base}: tallest bar length {lmax}, shortest {lmin}, so it looks {vis}× as tall; the real height ratio is only {real}×.
s2roGone: Start {base} is not below the shortest height {min} cm: that bar is cut away and cannot be seen.
:::

## Which horizontal line balances the “too tall” against the “too short”? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Average line
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: AVERAGE LINE
:::

This step answers: what is the average on the chart? Drag the line: orange marks how far bars stick out above it, violet marks how far bars fall short of it, and the readout adds each kind up. When the two totals are equal, the line’s height is the **mean** (add everything up, divide by how many). {#s3e .explain}

::: html step3-2
s3cv: Move a line and compare excess with shortfall
line: Line height (cm)
snap: Snap to the mean
:::

::: strings
s3ro: Line {L}: excess {up} in all, shortfall {down} in all, difference {diff} (cm, summed over 8 bars).
s3roBal: Balanced: this line is the mean, {m} cm.
:::

## A new student arrives; how far does the mean move? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 One more
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: ONE MORE
:::

This step answers: how does the mean react to one extra value? Drag the new student’s height: the grey dashed line is the old mean, the cyan line is the mean after joining. A taller newcomer lifts the line; a shorter one pulls it down. {#s4e .explain}

::: html step4-2
s4cv: The mean line before and after student 9 joins
extra: New student’s height (cm)
:::

::: strings
s4ro: Old mean {m0}; after adding {x} cm the mean is {m1}, a change of {sh} (check: (x − old mean) ÷ 9 = {chk}).
:::

## Draw a bar chart of your own data {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: with other data, can you still read the chart and the mean? Type 2 to 12 positive numbers separated by commas or spaces, and the page draws the bars and the mean line. {#s5e .explain}

::: html step5-2
s5cv: Bar chart of your data
own: Your data
recapTitle: Recap
recap1: A bar’s height is the data value; differences are measured with a bracket.
recap2: The axis start changes how big a gap looks, so check it before reading a chart.
recap3: The mean is the line where highs and lows cancel; new data pulls it toward itself.
modelTitle: Scope and limits of this model
modelText: The bars here are 8 illustrative heights, not a real survey. The balancing property holds for any list of numbers, but the mean need not be one of the values and says nothing about how spread out they are.
linkPd: → Distributions & Expectation: the mean seen as a balance point
linkClt: → Central Limit Theorem: what many means look like together
linkCoord: → Coordinate Plane: how the two axes locate a point
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: {n} values, mean {m}, largest {max}, smallest {min}.
s5roBad: Enter 2 to 12 numbers above 0, for example 12, 15, 9.
docTitle: Bar Charts · Numbers Standing in a Row
:::
