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
pageTitle: Place Value & the Counting Frame · Ten Makes One
tagline: The same digit stands for ten or a hundred times more one place to the left: on a counting frame, ten beads in a column trade for one bead in the next.
:::

## How do the beads give a number? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Read the frame
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: READ THE FRAME
:::

This step answers: what does the bead count in each column mean? From right to left the columns are ones, tens, hundreds, thousands. The **place value** is what each bead in a column is worth: 1 in the ones column, 10 in tens, 100 in hundreds, 1000 in thousands. Drag the four sliders to set the beads in each column; the number = the sum of (beads × place value). {#s0e .explain}

::: html step0-2
s0cv: A four-column counting frame
d3: Thousands beads
d2: Hundreds beads
d1: Tens beads
d0: Ones beads
:::

::: strings
s0ro: {n} = {expr}.
:::

## What happens when the ones column reaches 10 beads? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Ten makes one
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: TEN MAKES ONE
:::

This step answers: why does a column hold at most 9 beads? When a column reaches 10 beads, the 10 are traded for 1 bead in the column on the left (10 ones make 1 ten, 10 tens make 1 hundred). Press “Add 1 to ones” and count up to 10 to watch the carry; the orange column is where a carry just happened. {#s1e .explain}

::: html step1-2
s1cv: Each added bead may carry when a column fills
add1: Add 1 to ones
add10: Add 1 to tens
add100: Add 1 to hundreds
auto1: Add 1 to ones ten times
reset1: Clear
:::

::: strings
s1ro: Now {n}: {digits}.
s1roCarry: Just carried {c} time(s): {n} ({digits}).
s1roFull: It is at 9999; one more would overflow this four-column frame.
:::

## The same digit 3 in the ones, tens or hundreds place: how different? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Place sets size
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: PLACE SETS SIZE
:::

This step answers: why is a 3 worth different amounts in different places? Pick a digit d and a place: 1 bead in the ones column is one small square; 1 bead in the tens column is a strip of 10 squares; 1 bead in the hundreds column is a 10 × 10 sheet of squares. The picture shows d such pieces and the number below counts the squares. {#s2e .explain}

::: html step2-2
s2cv: Squares in the same digit at different places
dig: Digit d
pos: Place (0 = ones, 1 = tens, 2 = hundreds)
:::

::: strings
s2ro: {d} in the {col} place: {d} × {pv} = {v} small squares.
:::

## In 305, could we drop the 0? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Zero holds a place
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: ZERO HOLDS A PLACE
:::

This step answers: what does 0 do? It holds the place of an empty column so the digits on its left stay where they are. Set the hundreds, tens and ones sliders with tens = 0, then press “Remove the 0 in tens” and see what number the 3 and 5 make when they close up. {#s3e .explain}

::: html step3-2
s3cv: The frame with the 0 held, and with the 0 removed
h: Hundreds
te: Tens
o: Ones
drop: Remove the 0 in tens
keep: Put the 0 back
:::

::: strings
s3ro: {n} = {expr}; tens digit is {tens}.
s3roDrop: With the tens 0 removed the digits close up into {n2}: {n} became {n2}, a difference of {diff}.
s3roNoZero: The tens digit is not 0 now, so there is no empty column to hold; drag the tens slider to 0 to try it.
:::

## Which of two numbers is bigger, and which place do we check first? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Compare
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: COMPARE
:::

This step answers: how do we compare quickly and correctly? Start at the highest place (left) and compare place by place: at the first place where they differ, the bigger digit wins and the rest need not be looked at. Drag A and B: the orange cell is the first differing place, grey cells are equal places, dim cells need no checking. {#s4e .explain}

::: html step4-2
s4cv: A and B lined up place by place
A: Number A
B: Number B
:::

::: strings
s4ro: At the {col} place: A has {a}, B has {b}, so {rel}.
s4roEq: A and B match in every place, so they are equal.
relA: A is bigger
relB: B is bigger
:::

## Times 10 slides every digit one place left {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: what does multiplying by 10 do on the frame? Drag N: the three rows below are N, N × 10 and N × 100. Each ×10 moves every digit one column left and fills the ones place with 0. {#s5e .explain}

::: html step5-2
s5cv: Digit positions of N, N×10, N×100
N: N
recapTitle: Recap
recap1: Place value: the same digit is worth 10 times more one place to the left.
recap2: Ten makes one: a column with 10 trades for 1 in the next column, so each column holds at most 9.
recap3: 0 holds a place; compare from the highest place; ×10 slides everything one place left.
modelTitle: Scope and limits of this model
modelText: This page uses base ten and a four-column frame (up to 9999); the frame is a teaching tool, and real abaci or electronic counters store numbers differently. Place value works in any base, only the “ten makes one” trade changes.
linkExp: → Exponents & Logarithms: how each ×10 builds orders of magnitude
linkArea: → Multiplication as Area: splitting multi-digit products by place value
linkDiv: → Division & Remainder: sharing a number out by place
:::

Page complete. {#done .readout .success i18n=text}

::: strings
col0: ones
col1: tens
col2: hundreds
col3: thousands
col4: ten-thousands
s5ro: {n} × 10 = {n10}, {n} × 100 = {n100}: digits slide left and 0 fills the gap.
docTitle: Place Value & the Counting Frame · Ten Makes One
:::
