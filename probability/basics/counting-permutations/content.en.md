---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Permutations & Combinations · Counting How Many Ways
tagline: Count in steps and draw the tree; permutations and combinations differ by one sentence: does the order matter?
docTitle: Permutations & Combinations · Counting How Many Ways
:::

## Choose a shirt, then trousers, then shoes: how many outfits are there? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Multiply steps
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Counting in steps
:::

<b>This step answers: when you do several things in a row, how do you count the total ways?</b> Multiply the number of choices at each step: a × b × c. Each fork of the tree is a choice and every dot at the right is one complete outfit. Adding one option to any step adds a copy of everything that follows, which is why we multiply rather than add. Drag the three sliders and count the dots on the right. {#s0e .explain}

::: html step0-2
s0cv: A choice tree for shirt, trousers and shoes with the complete outfits as dots on the right
lblShirtN: Shirts
lblPantsN: Trousers
lblShoesN: Shoes
:::

## In how many ways can n different things be lined up? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 All arrangements
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Lining them up
:::

<b>This step answers: how many full arrangements are there?</b> The first place has n choices, the second n−1, …, the last just 1; multiplying gives n! = n × (n−1) × … × 1. For n ≤ 4 every arrangement is drawn below (each colour is a different thing); for larger n see the growth: 8! is already 40320. {#s1e .explain}

::: html step1-2
s1cv: All arrangements drawn for n up to 4; a log-scale bar chart of n! for larger n
lblN: Total n
:::

## In how many ways can you pick k of n and put them in order? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Permutations
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Pick k of n in order
:::

<b>This step answers: how do you count when only k of the places are filled?</b> Fill just k places: n choices for the first, n−1 for the second, …, n−k+1 for the k-th; multiplying gives nPr = n!/(n−k)!. The numbers in the blocks are the choices available at each place. The horizontal bars show the logarithmic size of nPr for each k, with the current k in orange. {#s2e .explain}

::: html step2-2
s2cv: Blocks showing the number of choices at each of k places and their product
lblK: Number picked k
:::

## If you only care which ones are picked and not the order, what do you divide out? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Combinations
:::

::: html step3-1
s3step: "Step 3 · "
s3k: When order does not matter
:::

<b>This step answers: what do combinations remove from permutations?</b> One chosen group of k people can be lined up in k! orders, and nPr counts each order as different. A group should count once, so nCr = nPr / k!. In the grid every row is one group (one combination) and its k! cells are all the orderings of that group; the total number of cells is nPr and the number of rows is nCr. {#s3e .explain}

::: html step3-2
s3cv: A grid in which each row is a combination and each cell in it is one ordering of that combination
:::

## “Choose 6 of 49”: what are the odds of getting it exactly right? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Big numbers
:::

::: html step4-1
s4step: "Step 4 · "
s4k: How big can combinations get
:::

<b>This step answers: how do the number of combinations set how hard it is to guess right?</b> If every combination is equally likely, the chance of hitting one specific combination is 1/nCr. Try the three examples: a 6-of-49 lottery is about one in fourteen million, a 5-card hand from a 52-card deck has 2.6 million possibilities, and a 3-person committee from 10 people has only 120. The bars use a log scale, so each step to the right is a factor of ten. {#s4e .explain}

::: html step4-2
s4cv: Log-scale bars of several combination counts with the chosen example
preLotto: Lottery: 6 of 49
prePoker: Poker hand: 5 of 52
preCommittee: Committee: 3 of 10
:::

::: strings
bm1: 1
bm10: 3 of 10 = 120
bm52: 5 of 52 = 2,598,960
bm49: 6 of 49 = 13,983,816
bmEuro: a 5-of-50 plus 2-of-12 lottery ≈ 140 million
lblChosen: chosen: {k} of {n}
s4ro: {name}: C({n},{k}) = {c} combinations; the chance of exactly one specific combination is about {p}.
axPeople: people n
axPMatch: P(at least two share a day)
s5ro: n = {n}: P(no match) = 365Pn/365ⁿ = {no}%, P(at least one match) = {yes}%; there are {pairs} pairs of people.
:::

## How many people must be in a room for it to be more likely than not that two share a birthday? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Birthday problem
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · probability by counting
:::

<b>This step answers: how do you turn a permutation count into a probability?</b> Take a 365-day year with equally likely birthdays. The number of ways for n people to all have different birthdays is 365Pn out of 365ⁿ equally likely combinations, so P(no match) = 365Pn/365ⁿ and P(at least one match) is 1 minus that. Drag the number of people: at 23 the chance already exceeds 50%, because the number of pairs, n(n−1)/2, grows fast. {#s5e .explain}

::: html step5-2
s5cv: Probability that at least two share a birthday rising with the number of people
lblPeople: People n
recapTitle: Recap
recap1: Multiply the choices at each step; all n in a line is n!; k in order is nPr = n!/(n−k)!.
recap2: When order does not matter divide by k!: nCr = nPr/k!.
recap3: With equally likely outcomes, probability = favourable ways ÷ total ways; pairs grow fast, which is why the birthday answer is surprisingly small.
modelTitle: Scope and limits of the model
modelText: Model: the choices are independent and every outcome is equally likely; the birthday problem assumes a 365-day year with equally likely days, ignoring leap years and twins. Real birthdays are not uniform, so real probabilities are slightly higher.
link0: → Number Theory & Combinatorics: reading combinations from Pascal’s row
link1: → Probability & Frequency: equally likely outcomes and repeated trials
link2: → Bayes: conditional probability through counting
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblShirt: shirts
lblPants: trousers
lblShoes: shoes
lblOutfits: {n} outfits
s0ro: {a} × {b} × {c} = {n} outfits (multiply the choices at each step).
axLogCount: n! (log scale)
s1ro: n = {n}: {steps} = {total} arrangements.
lblSlot: place {i}
lblEmpty: k = 0: exactly 1 way (pick nothing)
lblOrdered: {v} ordered selections
axLogPerm: bars: nPr for k from 0 to n (log scale)
s2ro: n = {n}, k = {k}: nPr = {f} = {v}; also n!/(n−k)! = {e}.
lblGridR: {rows} combination(s) (rows)
lblGridC: {cols} ordering(s) of each (columns)
lblRowNote: one colour per row = one group of people
s3ro: n = {n}, k = {k}: nPr = {pn}, each group has k! = {kf} orderings, so nCr = {formula} = {c}.
:::
