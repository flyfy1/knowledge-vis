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
pageTitle: Inequalities · A Tilted Scale Has a Whole Range of Answers
tagline: When the scale tilts, the answer is a range, not one number: shade it on the number line, and flip the sign when you multiply by a negative.
:::

## x plus 2 on the left, 5 on the right: which way does the scale tip? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Tilted scale
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: TILTED SCALE
:::

This step answers: what does an unbalanced scale tell us? The left pan holds a box of x kg plus a 2 kg weight; the right pan holds 5 kg. Drag x: if the left is heavier the scale tips left (**x + 2 &gt; 5**); if it is lighter it tips right (x + 2 &lt; 5); only equal weights balance. The sign says “which is bigger”. {#s0e .explain}

::: html step0-2
s0cv: The scale: x + 2 on the left, 5 on the right
xw: Weight of the box x (kg)
:::

::: strings
s0ro: x = {x}: the left pan holds {l} kg and the right 5 kg, so {res}.
lHeavy: the left is heavier, x + 2 > 5
lLight: the left is lighter, x + 2 < 5
lEq: they are equal, x + 2 = 5
:::

## Which values of x make x + 2 < 5 true? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 A range of answers
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: A RANGE OF ANSWERS
:::

This step answers: which x satisfy the inequality? The **solution set** is all the numbers that make it true. Drag x and press “Test this x”: a green dot means true, a red dot means false. After enough tests the green and red dots split into two stretches with the border at 3. Press “Show solution set” to see the shading: x < 3 (an open circle at 3, because 3 itself fails the strict “<”). {#s1e .explain}

::: html step1-2
s1cv: Tested points and the solution set on the number line
xt: The x to test
tryX: Test this x
showSol: Show / hide the solution set
clearX: Clear the tests
:::

::: strings
s1ro: {n} points tested: {g} true (green), {r} false (red); just tried x = {x}: {x} + 2 = {l}, {res}.
s1roNone: No tests yet. Drag x and press “Test this x”.
holdsYes: {l} < 5 is true
holdsNo: {l} < 5 is false
:::

## Add (or subtract) the same number on both sides: does the order change? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Add or subtract
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: ADD OR SUBTRACT
:::

This step answers: does adding or subtracting the same thing on both sides change the sign? Start from 2 < 5. Drag the number c to add: both numbers slide together on the number line and keep their distance, so 2 + c is still less than 5 + c. Solving x + 2 < 5 means subtracting 2 from both sides, giving x < 3. {#s2e .explain}

::: html step2-2
s2cv: Both numbers slide by c and keep their order
cc: Number c added to both sides
:::

::: strings
s2ro: 2 + {c} = {a}, 5 + {c} = {b}: {a} {op} {b}, still {d} apart.
:::

## Multiply both sides by a negative number: what happens to the sign? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Multiply by negative
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: MULTIPLY BY NEGATIVE
:::

This step answers: when does multiplying keep the order and when does it reverse it? Start from 2 < 5. Drag the multiplier m: multiplying by a positive stretches both points and keeps their order; multiplying by a negative moves them to the other side of zero, where the larger becomes the one further left, so **the order reverses and the sign must flip**; multiplying by 0 sends both to 0. {#s3e .explain}

::: html step3-2
s3cv: Where 2 and 5 land after multiplying by m
mm: Multiplier m
:::

::: strings
s3ro: 2 × {m} = {a}, 5 × {m} = {b}: {a} {op} {b} (it was 2 < 5). {note}
nPos: Multiplying by a positive keeps the sign.
nNeg: Multiplying by a negative flips the sign.
nZero: Multiplying by 0 turns both into 0.
:::

## How do we solve inequalities like a·x + b < c? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Solving
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: SOLVING
:::

This step answers: what are the steps for solving an inequality? Subtract b from both sides, then divide both sides by a: **when a is negative, flip the sign**. Drag a, b and c and switch between < and ≤: the solution set is shaded on the number line, and the circle at the border (c − b) ÷ a is open for < and filled for ≤. Then drag the test point and see whether it is inside the shading, and whether that agrees with plugging it in. {#s4e .explain}

::: html step4-2
s4cv: The solution set and a test point on the number line
opLt: < (less than)
opLe: ≤ (less than or equal)
aa: Coefficient a
bb: Constant b
c4: Right side c
tp: Test point x
:::

::: strings
s4ro: {lhs} {op} {c}: solving gives x {op2} {bd}; test point x = {x}: plugging in gives {v} {op} {c}, {res}, and it is {in}.
s4roZero: When a = 0, x disappears: the inequality is either always true or never true, so choose a ≠ 0.
yes: true
no: false
inShade: inside the shading
outShade: outside the shading
:::

## With M dollars at p each, how many books at most? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how are inequalities used in real life? If you buy n books you need p × n ≤ M, so n ≤ M ÷ p; but n must be a whole number, so take the largest whole number not above M ÷ p. Drag the money and the price and see the feasible whole numbers on the number line. {#s5e .explain}

::: html step5-2
s5cv: Numbers of books you can buy (whole numbers)
mon: Money M (dollars)
pr: Price per book p (dollars)
recapTitle: Recap
recap1: The solution of an inequality is a range, shaded on the number line: open circle for <, filled for ≤.
recap2: Adding or subtracting the same number keeps the sign; so does multiplying or dividing by a positive; by a negative it flips.
recap3: In real problems also check whether the variable may be fractional (a number of books must be whole).
modelTitle: Scope and limits of this model
modelText: This page covers only one-variable linear inequalities a·x + b < c (or ≤). The border is computed exactly as (c − b) ÷ a; slider steps keep values on easy-to-read marks. Systems of inequalities and absolute-value inequalities are not covered.
linkEq: → Equations on a Balance: doing the same to both sides keeps it level
linkNeg: → Negative Numbers: which is bigger on the number line
linkLin: → Linear Functions: the graph of y = kx + b, another view of inequalities
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: {p} × n ≤ {M}: n ≤ {q}, n whole, so at most {n} books, costing {cost}, leaving {left}.
docTitle: Inequalities · A Tilted Scale Has a Whole Range of Answers
:::
