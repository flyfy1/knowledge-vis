---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Mean, Median, Mode · Three “Averages”, Three Stories
tagline: The same list of salaries, three “averages” and three stories; once an extreme value arrives, only the median stays calm.
:::

## For one set of numbers, what are the mean, the median and the mode? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Three averages
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: THREE AVERAGES
:::

This step answers: what are the three “averages”? Here are the monthly salaries (in thousands) of 9 people in a small firm; each dot is one person. The **mean** = everything added up ÷ the number of people; the **median** = the middle value once sorted by size; the **mode** = the value that appears most often. Lines of different colours mark where they fall. {#s0e .explain}

::: html step0-2
s0cv: 9 people’s monthly salaries (thousands) and the three “averages”
:::

::: strings
s0ro: Mean = {sum} ÷ {n} = {mean}; median (the {k}th once sorted) = {med}; mode = {mode}.
:::

## The boss earns a lot: how do the three “averages” move? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Outliers
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: OUTLIERS
:::

This step answers: does one very large value affect the three “averages” equally? The highest salary in the list (originally 40) is the boss’s. Drag the boss’s salary: the mean is pulled up all the way, while the median and mode do not budge. The chart on the right shows the three “averages” as the boss’s salary changes. {#s1e .explain}

::: html step1-2
s1cv: The three “averages” as the boss’s salary changes
boss: Boss’s monthly salary (thousands)
:::

::: strings
s1ro: Boss earns {o}: mean {mean}, median {med}, mode {mode}. The mean is {diff} above the median.
:::

## What does the mode tell us? And what if there is no mode, or two? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Mode
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: MODE
:::

This step answers: how do we find the mode, and when is it not unique? Pick a value with the slider and press “Add” to put it into the data: a bar’s height is how often the value occurs, and the tallest bar is the mode. When several values tie for tallest there is more than one mode; when every value appears once there is none. {#s2e .explain}

::: html step2-2
s2cv: How often each value occurs
val: Value to add
add: Add
removeLast: Remove the last
clearAll: Clear
resetData: Restore the starting data
:::

::: strings
s2ro: {n} values: {list}; the most frequent occurs {c} times, mode: {mode}.
s2roEmpty: No data yet: choose a value and press “Add”.
:::

## With an odd or an even number of values, how do we find the median? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Median
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: MEDIAN
:::

This step answers: how is the median found? Sort the data from smallest to largest: with an odd count take the middle one; with an even count take the average of the middle two. Pick a data set and see the orange middle position, and how it differs from the mean. {#s3e .explain}

::: html step3-2
s3cv: Sorted data; orange is the middle position
setA: 5 values
setB: 6 values
setC: 7 skewed values
:::

::: strings
s3ro: Sorted: {sorted}, {n} values; middle position {where}, median = {med}; mean = {mean}.
whereOdd: value number {k}
whereEven: average of values number {k} and {k2}
:::

## When people say “average”, which one should be used? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Which one
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: WHICH ONE
:::

This step answers: how do we choose among the “averages”? Three situations: salaries (a few very high), shoe sizes (a shop stocking), exam scores (roughly symmetric). Pick the one you think suits best, then read the reasons the page gives and compare the three numbers. These reasons are common rules of thumb, not the only answer. {#s4e .explain}

::: html step4-2
s4cv: The data of three situations and their three “averages”
scSal: Salaries
scShoe: Shoe stocking
scScore: Exam scores
pickMean: Choose the mean
pickMed: Choose the median
pickMode: Choose the mode
checkP: Show reasons
:::

::: strings
s4roAsk: Situation: {sc}. Data {list}; mean {mean}, median {med}, mode {mode}. Which do you think suits best?
s4roReveal: Situation: {sc}: mean {mean}, median {med}, mode {mode}. The usual choice is the {best}: {why} You chose the {pick}.
bSal: median
wSal: A few very high salaries drag the mean up, so the median better describes the “typical person”.
bShoe: mode
wShoe: Stocking depends on which size sells most, so the mode answers directly.
bScore: mean
wScore: When scores are roughly symmetric with no extremes, the mean uses everyone’s score and carries the most information.
:::

## Compare the three “averages” on your own data {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: for other data, how do the three “averages” relate? Type 3 to 15 numbers separated by commas or spaces. A mean larger than the median usually means a few very large values are pulling the mean up. {#s5e .explain}

::: html step5-2
s5cv: Your data and the three “averages”
own: Your data
recapTitle: Recap
recap1: The mean uses every value, the median looks only at the middle once sorted, the mode asks which appears most.
recap2: An extreme value drags the mean and barely moves the median or mode.
recap3: There is no single right “average”: it depends on the question and on what the data look like.
modelTitle: Scope and limits of this model
modelText: The data here are illustrative sets, not real surveys. The “which to choose” reasons are rules of thumb, not theorems. A mode means little when every value appears once; continuous measurements usually need grouping before a mode makes sense.
linkBar: → Bar Charts: how a mean line balances highs and lows
linkAvg: → Averages: the mean seen as levelling water
linkClt: → Central Limit Theorem: the shape of many means together
linkPd: → Distributions & Expectation: the mean as a balance point
:::

Page complete. {#done .readout .success i18n=text}

::: strings
mMean: mean
mMed: median
mMode: mode
noMode: none (every value appears once)
s5ro: {n} values: mean {mean}, median {med}, mode {mode}; the mean is {rel} the median.
relMore: above
relLess: below
relEq: equal to
s5roBad: Enter 3 to 15 numbers (separated by commas or spaces), for example 3, 4, 4, 9.
docTitle: Mean, Median, Mode · Three “Averages”, Three Stories
:::
