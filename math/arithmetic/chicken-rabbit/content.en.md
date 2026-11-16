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
pageTitle: Chickens & Rabbits · Assume First, Let the Gap Speak
tagline: Know the heads and the feet: assume they are all chickens, and the extra feet give away how many rabbits there are.
:::

## 35 heads and 94 feet in a cage: how many rabbits? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Heads and feet
:::

::: html step0-1
s0step: "STEP 0 · "
s0k: HEADS AND FEET
:::

This step answers: how can we find the number of rabbits by trying? There are 35 animals (one head each); a chicken has 2 feet and a rabbit 4. Drag the slider to set the number of rabbits r, the rest are chickens: legs are drawn animal by animal and the foot total is counted from them, so you can see where it hits 94. {#s0e .explain}

::: html step0-2
s0cv: 35 animals: chickens have 2 legs, rabbits 4
rab: Number of rabbits r
:::

::: strings
s0ro: {r} rabbits and {c} chickens: {f} feet (target 94), {cmp}.
cmpEq: exactly the target
cmpLess: {d} short of the target
cmpMore: {d} over the target
:::

## Assume all chickens first: how many to swap for rabbits? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 All chickens
:::

::: html step1-1
s1step: "STEP 1 · "
s1k: ALL CHICKENS
:::

This step answers: how can we approach the answer step by step instead of guessing? Assume all 35 are chickens: 2 × 35 = 70 feet. Swapping one chicken for a rabbit adds 4 − 2 = 2 feet. Press “Swap one” and watch the feet climb step by step until they reach the target 94, or press “Keep swapping”. {#s1e .explain}

::: html step1-2
s1cv: Each swap lifts the foot count by two
swap: Swap one
auto: Keep swapping
reset1: Start over (all chickens)
:::

::: strings
s1ro: {k} swapped: {f} feet; {gap} feet short, +2 per swap, so {need} more swaps needed.
s1roDone: {k} swapped, and {f} feet is exactly 94: {k} rabbits, {c} chickens.
:::

## With other heads and feet, how do we compute directly? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Any numbers
:::

::: html step2-1
s2step: "STEP 2 · "
s2k: ANY NUMBERS
:::

This step answers: can we get the rabbit count in one calculation? With H heads and F feet: all chickens would have 2H feet, so the surplus is F − 2H, and each rabbit accounts for 2 of it: rabbits = (F − 2H) ÷ 2, chickens = H − rabbits. The slanted line shows feet as a function of the rabbit count r; the flat line is your F; where they cross is r. {#s2e .explain}

::: html step2-2
s2cv: Feet rise with the number of rabbits and meet the target
H: Heads H
F: Feet F
:::

::: strings
s2ro: H = {H}, F = {F}: rabbits = ({F} − 2 × {H}) ÷ 2 = {r}, chickens = {c}; check 2 × {c} + 4 × {r} = {chk}.
bad1: {F} feet is odd: chickens and rabbits both have an even number of feet, so an odd total is impossible.
bad2: {F} feet is fewer than the all-chicken minimum {min}: you always have at least {min} feet.
bad3: {F} feet is more than the all-rabbit maximum {max}: there can be at most {max} feet.
:::

## Starting from “all rabbits”, do we get the same answer? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Other start
:::

::: html step3-1
s3step: "STEP 3 · "
s3k: OTHER START
:::

This step answers: does another starting assumption change the result? Choose “all rabbits”: feet start at 4H and drop by 2 for each rabbit swapped to a chicken; choose “all chickens”: start at 2H and climb. Drag the number of swaps and watch both routes walk along the foot axis to the same target F (using H and F from step 2). {#s3e .explain}

::: html step3-2
s3cv: Walking to the target from either end of the foot axis
hypC: Assume all chickens (feet from low to high)
hypR: Assume all rabbits (feet from high to low)
swaps: Number of swaps
:::

::: strings
s3ro: {hyp}: start {start}, each swap {dir}, target {F}; {need} swaps needed. Now {k} swapped, {f} feet.
dirUp: adds 2
dirDown: removes 2
startC: all chickens
startR: all rabbits
s3roBad: The current H and F from step 2 have no solution; go back to step 2 and pick a pair that works.
s3roDone: Reached the target: {f} feet after {k} swaps; both assumptions give {r} rabbits.
:::

## Bicycles and tricycles, big boats and small boats: the same method? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 New story
:::

::: html step4-1
s4step: "STEP 4 · "
s4k: NEW STORY
:::

This step answers: which problems fit this method? Any “two kinds, each carrying a different amount, with known count and total amount” does. Pick a story and drag the total count and total amount: assume all of the first kind, find the gap, then divide by the difference between the kinds. {#s4e .explain}

::: html step4-2
s4cv: The total rises as units are swapped to the second kind
scen: Choose a story
sc0: Chickens & rabbits (feet)
sc1: Bicycles & tricycles (wheels)
sc2: Small & big boats (seats)
cnt: Total count
tot: Total amount
:::

::: strings
sc0a: chicken
sc0b: rabbit
sc0u: feet
sc1a: bicycle
sc1b: tricycle
sc1u: wheels
sc2a: small boat
sc2b: big boat
sc2u: seats
s4ro: {H} in all, {F} {u}: assume all {na}, giving {allA} {u}, a surplus of {sur}; swapping one {na} for a {nb} adds {per}, so {nb} = {sur} ÷ {per} = {r}, {na} = {c}.
s4roBad: No whole-number solution: each {na} has {a} and each {nb} has {b}, so total {u} must be between {lo} and {hi} and reachable in steps.
:::

## Make your own puzzle, then solve it back {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Wrap-up
:::

::: html step5-1
s5step: "STEP 5 · "
s5k: WRAP-UP
:::

This step answers: can you set a puzzle and verify the method? Drag the numbers of chickens and rabbits; the page computes the heads and feet (that is your puzzle), then solves it back with “assume all chickens” to see if the rabbit count matches. {#s5e .explain}

::: html step5-2
s5cv: Your chickens and rabbits
cc: Number of chickens
rr: Number of rabbits
recapTitle: Recap
recap1: Assume everything is one kind; the gap ÷ the change per swap = the number of the other kind.
recap2: Check the answer by substituting back: 2 × chickens + 4 × rabbits should equal the feet.
recap3: Starting from “all chickens” or “all rabbits” gives the same answer.
modelTitle: Scope and limits of this model
modelText: We assume each chicken has exactly 2 feet, each rabbit exactly 4, and whole animals. “Assume all one kind” is just a way to compute the gap, not a claim about what is in the cage.
linkEq: → Equations on a Balance: the same method written as an equation
linkLin: → Linear Functions: the crossing of two lines is the answer
linkPat: → Patterns: what happens when a total gains the same amount each time
:::

Page complete. {#done .readout .success i18n=text}

::: strings
s5ro: Puzzle: {H} heads, {F} feet. Assume all chickens → {allA} feet, surplus {sur}, ÷ 2 = {r} rabbits; your {r0} rabbits: {ok}.
same: match
docTitle: Chickens & Rabbits · Assume First, Let the Gap Speak
:::
