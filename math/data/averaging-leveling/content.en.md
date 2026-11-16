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
pageTitle: Averages · Level by Pouring
tagline: Pour water between uneven cups until they are level: the common level is the mean.
:::

## Pour water between 5 cups: does the total change? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Pouring keeps water
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: POURING KEEPS WATER
:::

This step answers: when we pour from one cup into another, what changes and what stays the same? Each block in a cup stands for 1 unit of water. Pick the cup to pour from and the cup to pour into, then press “Pour 1 unit”: those two levels change, but all the cups added together (the total) stays the same. {#s0e .explain}

::: html step0-2
s0cv: Water in 5 cups
from: Pour from cup #
to: Pour into cup #
pour1: Pour 1 unit
reset0: Restore the start
:::

::: strings
s0ro: Levels {levels}; total = {total} units (it was {total0} at the start), {k} pours so far.
s0roBad: Cannot pour: {why}.
whyEmpty: the source cup is empty
whySame: source and target are the same cup
whyFull: the target cup is full
:::

## What is the fewest pours to make 5 cups level? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Level out
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: LEVEL OUT
:::

This step answers: how many units must move from the high cups to the low ones before everything is level? Press “Pour 1 unit (tallest → lowest)” to move one unit from the tallest cup to the lowest, or “Keep pouring until level”. The **mean** is the level each cup ends up at. {#s1e .explain}

::: html step1-2
s1cv: Pouring from the tallest cup to the lowest until level
move: Pour 1 unit (tallest → lowest)
auto: Keep pouring until level
reset1: Start over
:::

::: strings
s1ro: {k} units moved; levels {levels}, tallest {mx}, lowest {mn}.
s1roDone: Level: {m} units each after {k} moves, exactly the total amount that stuck out above the mean at the start, {ex}.
:::

## Without pouring, how do we get the level directly? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Total ÷ cups
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: TOTAL ÷ CUPS
:::

This step answers: how much will each cup hold once level? Pouring does not change the total, and a level result has the same amount in every cup, so each cup = total ÷ number of cups. Drag the number of cups: the top row is the original levels, the bottom row is the same total shared equally. {#s2e .explain}

::: html step2-2
s2cv: Original levels and the level after sharing equally
cups: Number of cups used k
:::

::: strings
s2ro: The first {k} cups hold {total} units, so the mean is {total} ÷ {k} = {m} units each.
:::

## When the total does not split evenly, what does “level” mean? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Won't divide
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: WON'T DIVIDE
:::

This step answers: what if the water cannot be split into whole units equally? 5 cups hold T units in all. With “whole units only”, some cups end up 1 unit higher, never more than 1 apart; with “any amount” the cups can be exactly level at T ÷ 5 each. Drag the total T and compare. {#s3e .explain}

::: html step3-2
s3cv: Level results with whole units and with any amount
whole: Whole units only
any: Any amount
tot: Total water T (units)
:::

::: strings
s3ro: T = {T}: T ÷ 5 = {m}; with whole units, {n1} cups hold {hi} and {n0} cups hold {lo}.
s3roAny: T = {T}: every cup holds exactly {m} units (any amount can be exactly level).
s3roEven: T = {T} divides by 5: whole units can be exactly level too, {m} units each.
:::

## What happens to the mean if one cup is very full? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Outliers
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: OUTLIERS
:::

This step answers: is the mean always in the middle? Drag the amount in cup 3 and watch the mean line get pulled up; count how many cups lie below the line and how many above. The mean is total ÷ number of cups, so a very large value lifts it overall without giving any other cup more water. {#s4e .explain}

::: html step4-2
s4cv: One very full cup and the mean line
big: Water in cup 3
:::

::: strings
s4ro: Levels {levels}, mean {m}; {lo} cups are below the mean and {hi} are above it.
:::

## Set four cups yourself and read the mean {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: for any four cups, what is the mean and how much must move? Drag the four sliders: the page computes the mean line and the total amount that must go from cups above it to cups below it (it need not be a whole number). {#s5e .explain}

::: html step5-2
s5cv: Your four cups
a: Cup A
b: Cup B
c: Cup C
d: Cup D
recapTitle: Recap
recap1: Pouring keeps the total: the total stays, the levels change.
recap2: Mean = total ÷ count, and it is the level everything shares after levelling.
recap3: The mean need not equal any cup’s level, and extreme values pull it.
modelTitle: Scope and limits of this model
modelText: Seeing the mean as “pour until level” assumes water moves freely with no loss and can be divided; with whole units the mean may not be reachable exactly. The mean sums things up but hides how different the cups are.
linkBar: → Bar Charts: see excess and shortfall cancel on a bar chart
linkPd: → Distributions & Expectation: another reading of the mean, the balance point
linkEq: → Equations on a Balance: doing the same to both sides keeps it level
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Mean = {total} ÷ 4 = {m}; {ex} units stick out above the mean and must go to cups below it.
docTitle: Averages · Level by Pouring
:::
