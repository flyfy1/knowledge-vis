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
pageTitle: Simultaneous Equations · Where Two Lines Meet
tagline: One equation has endless solutions; a second equation pins the answer to where two lines cross. Substitution and elimination are two ways to calculate it.
:::

## How many solutions does x + y = 10 have? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One is not enough
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: ONE IS NOT ENOUGH
:::

This step answers: can one equation fix both x and y? A **solution** is a pair (x, y) that makes the equation true. Drag x and y follows from the equation: y = 10 − x. On the graph, x + y = 10 is a line and every point on it is a solution, endlessly many, so one equation cannot pin down x and y. {#s0e .explain}

::: html step0-2
s0cv: Every point on the line x + y = 10 is a solution
x0: Value of x
:::

::: strings
s0ro: x = {x}: y = 10 − {x} = {y}, so ({x}, {y}) is on the line; there are 11 whole-number solutions (x = 0 to 10) and endlessly many real ones.
:::

## Which point satisfies both equations at the same time? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Both at once
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: BOTH AT ONCE
:::

This step answers: what is the solution of a system on the graph? A **system** is two equations that must both hold, and its solution is an (x, y) satisfying both. Drag the orange point’s x and y: each equation’s “miss” = left side − right side, and an equation holds only when its miss is 0. Two lines meet in a single point, and only there are both misses 0. {#s1e .explain}

::: html step1-2
s1cv: Two lines and the orange point; the crossing is the solution
presetLabel: Choose a system
px: Point x
py: Point y
snap: Move to the crossing
:::

::: strings
s1ro: Equation 1 {e1}: miss {r1}; equation 2 {e2}: miss {r2}. {res}
bothOk: Both misses are 0: this is the solution.
notBoth: Not both true yet.
:::

## How do we calculate that crossing? (substitution) {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Substitution
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: SUBSTITUTION
:::

This step answers: without the graph, how do we work out x and y? **Substitution**: rewrite one equation as y = …, then put that into the other equation; y disappears and only x remains. Press “Next step” to go line by line, every step computed from the real numbers. {#s2e .explain}

::: html step2-2
s2cv: The x-only equation after substitution is the vertical line through the crossing
prev: Previous step
next: Next step
resetS: Start over
:::

::: strings
sub0: The system: {e1}; {e2}.
sub1: Solve equation 1 for y: y = {expr}.
sub2: Substitute into equation 2: {lhs} = {c2}.
sub3: Simplify: {A}x = {B}, only x is left.
sub4: So x = {x}.
sub5: Substitute back for y: y = {y}.
sub6: Check: equation 1’s left side is {l1}, which equals {c1}; equation 2’s left side is {l2}, which equals {c2}.
s2ro: Step {k} of 6. The solution is ({x}, {y}).
s2roStart: Press “Next step” to begin.
:::

## How do we add or subtract y away? (elimination) {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Elimination
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: ELIMINATION
:::

This step answers: without substituting, can we make y vanish? **Elimination**: multiply the two equations by suitable numbers so the y-coefficients are opposites (or equal), then add (or subtract) the equations and y cancels. On the graph the new equation contains only x, so it is a vertical line, and it passes right through the crossing. {#s3e .explain}

::: html step3-2
s3cv: The sum is a vertical line x = constant through the crossing
:::

::: strings
el0: The system: {e1}; {e2}.
el1: Make the y-coefficients opposites: equation 1 × {k1}, equation 2 × {k2}, giving {e1s}; {e2s}.
el2: Add the two: y cancels, leaving {A}x = {B}.
el3: So x = {x}.
el4: Substitute into equation 1 for y: y = {y}.
el5: Check: equation 1’s left side is {l1}, which equals {c1}; equation 2’s left side is {l2}, which equals {c2}.
s3ro: Step {k} of 5. The solution is ({x}, {y}).
:::

## Does a system always have exactly one solution? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Special cases
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: SPECIAL CASES
:::

This step answers: when is there no solution, and when infinitely many? Equation 1 is fixed as x + y = 4 and equation 2 is k·x + y = c. Drag k and c: lines with different slopes (k ≠ 1) cross at one point; with equal slopes (k = 1), c ≠ 4 makes the lines parallel with no common point (no solution), and c = 4 makes them the same line (infinitely many). The discriminating number is D = 1 × 1 − k × 1 = 1 − k. {#s4e .explain}

::: html step4-2
s4cv: Two lines: crossing, parallel or identical
kk: Coefficient k of x in equation 2
cc: Right side c of equation 2
:::

::: strings
s4ro: Equation 2: {e2}; D = {D}: {res}
oneSol: exactly one solution ({x}, {y})
noSol: the lines are parallel: no solution
manySol: the lines coincide: infinitely many solutions
:::

## Apples and oranges: set the prices, then work them out {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: how does a word problem become a system? One purchase is 3 apples and 2 oranges, another is 2 apples and 4 oranges. With apple price p and orange price q: 3p + 2q = total 1 and 2p + 4q = total 2. Drag the two real prices; the page computes both totals and then solves the system back to see whether it recovers them. {#s5e .explain}

::: html step5-2
s5cv: The two equations’ lines in the (p, q) plane and the solution
pa: Apple price p
po: Orange price q
recapTitle: Recap
recap1: One equation has endless solutions; the common solution of two is the crossing of two lines.
recap2: Substitution: solve for one unknown and put it in the other equation; elimination: scale, then add or subtract to remove one unknown.
recap3: When D = 0 the lines are parallel or the same: no solution or endlessly many.
modelTitle: Scope and limits of this model
modelText: This page treats only two unknowns and two linear equations, with numbers picked for easy hand calculation; the graph shows roughly 0 to 12. Systems with more unknowns use matrices, with the same idea.
linkLin: → Linear Functions: slope and intercept of one line, and two lines meeting
linkEq: → Equations on a Balance: doing the same to both sides
linkLt: → 2D Linear Transforms: a system as a matrix, where D is the determinant
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Prices p = {p}, q = {q}: total 1 = 3 × {p} + 2 × {q} = {t1}, total 2 = 2 × {p} + 4 × {q} = {t2}. Solving the system gives p = {sp}, q = {sq}: {ok}.
same: it matches yours
docTitle: Simultaneous Equations · Where Two Lines Meet
:::
