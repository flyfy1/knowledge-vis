---
lang: en
---

::: strings
languageLabel: Language
back: ← Knowledge Index
navLabel: Step navigation
catBadge: Chemistry
stageBadge: Junior High
foot: Balancing Chemical Equations · Built by Claude Sonnet via Mini Claude Code · static bilingual page
docTitle: Balancing Chemical Equations · Every Atom Count Must Match
pageTitle: Balancing Chemical Equations
tagline: Reactions never create or destroy atoms, so every element must have equal counts on both sides — balancing means adjusting coefficients until every little scale is level.
:::

## What is wrong with writing H₂ + O₂ → H₂O? {#step0 h2=s0t}

::: strings
nav0: 0 Why balance
:::

Step 0 · Why balance {#s0k .step-kicker i18n=text}

This step asks: why is H₂ + O₂ → H₂O, hydrogen and oxygen making water, not yet a correct equation? A **chemical equation** uses formulas and an arrow: **reactants** on the left, **products** on the right. The number in front of a formula is its **coefficient** (how many of that molecule; omitted when it is 1); the small subscripts inside a formula count atoms in one molecule, so when balancing you **change coefficients only, never subscripts**. Each element gets a little scale; unequal counts tip it. Drag the coefficients until every scale is level. {#s0e .explain}

::: html step0-1
s0stage: One little scale per element: the left pan is that atom’s total on the reactant side, the right pan the product side; green when level, pink when off
s0canvas: Hydrogen and oxygen scales: atom totals and beam tilt change with the coefficients
coef1: Coefficient of substance 1
coef2: Coefficient of substance 2
coef3: Coefficient of substance 3
:::

Takeaway: balancing means each element has equal totals on both sides. Holds when only coefficients change, never formulas; all reactions here are treated as ideal and complete. {#s0result .readout i18n=text}

::: strings
s0ro: {eq}: {tally}. {verdict}
s0ok: Both scales are level: the equation is balanced.
s0no: Not level yet: some element differs between sides, so change a coefficient.
:::

## With several elements to fix, which one first? {#step1 h2=s1t}

::: strings
nav1: 1 Where to start
:::

Step 1 · Where to start {#s1k .step-kicker i18n=text}

This step asks: in methane burning, CH₄ + O₂ → CO₂ + H₂O, when several atoms are off, in what order is balancing easiest? A good habit is to start with elements that show up in only one reactant and one product (here C and H) and leave oxygen, which is everywhere, for last. Drag the slider through four stages and see which scale gets levelled when. {#s1e .explain}

::: html step1-1
s1stage: Three little scales: carbon, hydrogen, oxygen; the stage slider sets the coefficients to that stage’s result
s1canvas: Three scales for methane burning being levelled in turn: carbon, then hydrogen, then oxygen
s1st: Balancing stage
:::

Takeaway: fix the elements that appear least often first and leave everywhere-elements like O or H for last. A rule of thumb, not the only method; some reactions need an odd count handled first. {#s1result .readout i18n=text}

::: strings
st0: Start: every coefficient is 1
st1: Carbon first: 1 on the left, 1 on the right, already level, nothing to change
st2: Then hydrogen: 4 on the left, 2 on the right; make the H₂O coefficient 2 and hydrogen levels
st3: Oxygen last: the right has 2 in CO₂ plus 2 in two H₂O = 4, so make the O₂ coefficient 2 and oxygen levels too
s1ro: Stage {st}: {note}. Now {eq}, {tally}.
:::

## In Fe + O₂ → Fe₂O₃ oxygen is 2 on one side and 3 on the other — now what? {#step2 h2=s2t}

::: strings
nav2: 2 Odd meets even
:::

Step 2 · Odd meets even {#s2k .step-kicker i18n=text}

This step asks: each O₂ on the left holds 2 oxygen atoms and each Fe₂O₃ on the right holds 3 — how can the totals match? Use the least common multiple of 2 and 3, which is 6: get 6 oxygen atoms on each side, then go back and fix iron. Drag the coefficients; if you are stuck press “Give me a hint” to be told which coefficient to change next. {#s2e .explain}

::: html step2-1
s2stage: Iron and oxygen scales; the atom counts on both sides are recomputed as you change coefficients
s2canvas: Iron and oxygen scales both level when the coefficients reach 4, 3, 2
s2hint: Give me a hint
s2reset: Set all coefficients to 1
:::

Takeaway: when odd meets even, use the least common multiple to find the coefficients. Holds for positive whole-number coefficients and reactions that have a solution. {#s2result .readout i18n=text}

::: strings
s2ro: {eq}: {tally}. {verdict}
s2hintMsg: Hint: change the coefficient of substance {i} to {v} next (it is {v} in the smallest whole-number solution).
s2solved: Balanced, and in the simplest whole-number ratio.
s2solvedBig: Level, but every coefficient can be divided by {g} to reach the simplest ratio.
:::

## 4 H₂ + 2 O₂ → 4 H₂O is level too — so why write 2 : 1 : 2? {#step3 h2=s3t}

::: strings
nav3: 3 Simplest ratio
:::

Step 3 · Simplest ratio {#s3k .step-kicker i18n=text}

This step asks: multiply every coefficient by 2 or 3 and it still balances, so why write the smallest set? Balancing gives the **ratio** of molecule counts, and by convention we write it as the smallest whole-number ratio (no common factor above 1). Drag the multiplier k and watch the atom counts scale up in step while the scales stay level. {#s3e .explain}

::: html step3-1
s3stage: Hydrogen and oxygen scales: as k grows both pans grow in proportion and stay level
s3canvas: Hydrogen–oxygen scales: counts grow with the multiplier but stay balanced
s3k2: Multiplier k
:::

Takeaway: the balanced result is written as the smallest whole-number ratio. Holds for positive whole coefficients (no half molecules); the ratio is fixed by conservation of atoms. {#s3result .readout i18n=text}

::: strings
s3ro: {eq}: {tally}. {verdict}
s3simple: Simplest whole-number ratio (no common factor).
s3notSimple: Level, but the coefficients share a factor of {g}, so it can be reduced.
:::

## Swap reactions and balance them yourself {#step4 h2=s4t}

::: strings
nav4: 4 Try it
:::

Step 4 · Try it {#s4k .step-kicker i18n=text}

This step asks: given a reaction you have not seen, how do you balance it with the methods so far? Pick a reaction and drag coefficients until every scale is level and the ratio is in simplest form. Each reaction you finish goes into the checklist below. {#s4e .explain}

::: html step4-1
s4stage: The scales follow your coefficients live; all green and no common factor counts as done
s4canvas: Scales for the chosen reaction, one per element
s4rx: Pick a reaction
coef4: Coefficient of substance 4
s4reset: Set all coefficients to 1
:::

Takeaway: start with the least frequent elements, use the least common multiple for odd/even mismatches, then reduce to the simplest ratio. Works for simple reactions like these; complex redox reactions need a more systematic method. {#s4result .readout i18n=text}

::: strings
lblL: Reactants
lblR: Products
lblBal: level
lblOff: off
rx0: Hydrogen + oxygen → water
rx3: Nitrogen + hydrogen → ammonia
rx4: Propane burning
rx5: Potassium chlorate decomposing
rx6: Aluminium + hydrochloric acid
rx7: Magnesium burning
s4ro: {eq}: {tally}. {verdict} Finished {n} / {tot}: {list}
s4done: done
s4list0: (none yet)
:::

## Explain balancing to a friend {#step5 h2=s5t h2part=1}

::: strings
nav5: 5 Recap
:::

::: html step5-1
s5k: Step 5 · Recap
s5e: Balancing = adjusting coefficients so each atom count matches on both sides, then reducing to the simplest whole-number ratio.
f1t: Rule
f1b: Change coefficients only, never subscripts; one scale per element, all level.
f2t: Order
f2b: Start with elements that appear once; leave O and H for last; use the least common multiple for odd/even mismatches.
f3t: Check
f3b: Count every atom on both sides; reduce coefficients to the simplest whole-number ratio.
modelT: Honest model notes
model1: Every reaction here is treated as ideal and complete; whether it happens, how fast, or whether it is reversible is out of scope.
model2: The scales count atoms only; real balancing also tracks charge (ionic equations) and state symbols.
model3: The hints and smallest solutions come from an exhaustive search up to coefficient 12; reactions beyond that are not covered.
nextT: Keep going (on this site)
l1: Mass Conservation · step 2: when it does not balance, atom counts and the balance mass both warn
l2: Molecules & Atoms · step 4: molecules change, the atom ledger does not
l3: Chemical Equilibrium · step 0: reactions can run both ways (this page covers one-way ideal reactions only)
:::
