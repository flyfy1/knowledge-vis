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
pageTitle: Expected Value · Lotteries, Dice and Insurance on One Scale
tagline: Expected value is the fair price of a long-run average: use it to judge a bet, and to see why insurance can be worth buying even at a loss on average.
docTitle: Expected Value · Lotteries, Dice and Insurance on One Scale
:::

## In a game with random outcomes, how much do you get “on average”? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Weighted sum
:::

::: html step0-1
s0step: "Step 0 · "
s0k: The weighted sum
:::

<b>This step answers: how is the expected value computed?</b> Multiply each outcome by its probability and add them all: E = Σ p·x. Each table row is “value × probability = contribution”, and the bar lays the contributions end to end; the black line marks E. Pick one of four games: a die (E = 3.5, yet you can never roll 3.5), a coin that pays 2 or 0, a roulette bet on red (returns 2 with probability 18/38), and a lottery (a tiny chance of one million). {#s0e .explain}

::: html step0-2
s0cv: A table of outcome, probability and contribution, and a bar laying the contributions end to end
gDie: Roll a die (win the face)
gCoin: Coin (heads wins 2)
gRoulette: Roulette on red (a win returns 2)
gLotto: Lottery (a million prize)
:::

::: strings
gDieN: every face is equally likely.
gCoinN: half the time 2, half the time 0.
gRouletteN: wins with probability 18/38 (two green pockets), so slightly unfavourable.
gLottoN: a 1-in-13,983,816 chance, so the expectation is tiny.
lblTable: value × probability = contribution
lblStack: bar: contributions end to end; total length = E
s0ro: {game}: E = Σ p·x = {E}; {expl}
lblFair: fair price {E}
axPrice: price
axNet: net expectation
vGood: wins on average
vBad: loses on average
vFair: exactly fair
s1ro: {game}: price {price}, E = {E}, net expectation {net} ({verdict}); average loss relative to the price {edge}%.
:::

## What is the most you should pay to play without losing on average? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Fair price
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The fair price
:::

<b>This step answers: what price makes the game fair?</b> Net expectation = E − price. At price = E the net expectation is zero: that is the fair price; above it you lose on average, below it you gain. A 1-unit roulette bet on red returns 36/38 ≈ 0.947 in expectation, a 5.3% average loss per bet: the “house edge”. Drag the price and see whether the dot on the orange line is green or red. {#s1e .explain}

::: html step1-2
s1cv: The net expectation falling linearly with the ticket price; the vertical line is the fair price
lblPrice: Price per play
:::

## A few plays look chaotic; what about very many? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Long run
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The long-run average
:::

<b>This step answers: why is expected value called the “long-run average”?</b> The orange line is the average payoff of the first n plays. It swings wildly at first and settles toward the dashed line E; the grey lines are E ± 2σ/√n, the typical error, narrowing like 1/√n. It uses the game picked in step 0. Try the lottery: within a few thousand plays you almost never win, the average sits near 0 and far below E; the expectation takes a very long run to show up. {#s2e .explain}

::: html step2-2
s2cv: The running average payoff approaching the expected value as plays accumulate
play1: Play 1 more
play100: Play 100 more
play1000: Play 1000 more
reset: Reset
:::

::: strings
axTrials: plays
s2ro0: {game}: press a Play button to begin (outcomes come from a fixed seed).
s2ro: After {n} plays the average is {avg}, E = {E}, off by {err}; the typical error σ/√n ≈ {se}.
s3ro: {n} dice, shift {b}: E = {each}×{n} + {b} = {sum} (the expectation computed from the distribution is {E}).
lblNoIns: no insurance
lblIns: insured
s4ro: Loss {loss}, probability {p}%, premium {prem}: uninsured expectation {eu} (standard deviation {su}), insured expectation {ei} (standard deviation {si}); the insurer’s expected profit {prof}.
axBank: prize-cap exponent M
axFair: fair price
s5ro0: M = {M} (prize cap {bank}): fair price = M + 1 = {E}. Press Play to see real outcomes.
s5ro1: M = {M} (cap {bank}), fair price {E}; {n} plays so far: average {avg}, median {med}, largest {mx}.
:::

## When you add several results together, is the expectation the sum of the expectations? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Additivity
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Expectation is additive
:::

<b>This step answers: how do you compute the expectation of a sum?</b> E[X + Y] = E[X] + E[Y], with no independence required; E[aX + b] = aE[X] + b. Roll n dice, each with E = 3.5, and the expected sum is 3.5n; shift everything by b and the expectation shifts by b. The bars show the full distribution of the sum (built by convolving die by die) and the orange line sits at 3.5n + b. Drag the number of dice and the shift. {#s3e .explain}

::: html step3-2
s3cv: Bars of the distribution of the sum of n dice with the expectation as an orange line
lblDice: Number of dice n
lblShift: Shift b
:::

## If the premium exceeds the expected loss, why do people still buy insurance? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Insurance
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Insurance: risk beyond the expectation
:::

<b>This step answers: why can it be worth it even when the expectation is no better?</b> A house loss L happens with probability p. Without insurance the expectation is −pL, but with probability p you lose L all at once; with insurance you pay the premium for certain, expectation −premium. The insurer’s expected profit is premium − pL (to cover its costs). Buying has the worse expectation but swaps a large uncertain loss for a small certain one: the standard deviation falls from large to 0. Expectation is half the story; the other half is risk (variance). {#s4e .explain}

::: html step4-2
s4cv: The outcomes without insurance (two possibilities) and with insurance (one certain outcome)
lblLoss: Possible loss L (thousands)
lblPm: Probability p (per mille)
lblPrem: Premium
:::

## For a game with an infinite expectation, how much should you pay to play? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 St. Petersburg
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · the St. Petersburg paradox
:::

<b>This step answers: does a huge expectation always justify a huge price?</b> Flip a coin until the first head; if it comes on flip k the prize is 2ᵏ. Each k contributes 2ᵏ × 2⁻ᵏ = 1, so the expectation is infinite. But the bank is finite: with prizes capped at 2ᴹ the expectation is only M + 1, growing just logarithmically with the bank. Play a few: the average is dragged up by rare big wins while the median stays tiny. Expectation answers “the long-run average”, not “what you will get this time”. {#s5e .explain}

::: html step5-2
s5cv: The fair price with capped prizes growing about linearly with the bank exponent M
lblBank: Prize cap 2^M, exponent M
st100: Play 100
st1000: Play 1000
recapTitle: Recap
recap1: Expected value E = Σ p·x weights each outcome by its probability; it is the long-run average, not what a single play gives.
recap2: The fair price is E; a higher price loses on average. Expectation is additive: E[X+Y] = E[X] + E[Y].
recap3: Beyond expectation there is risk: insurance trades a worse expectation for far less variation, and an infinite expectation does not mean a huge price is worth paying.
modelTitle: Scope and limits of the model
modelText: Model: independent plays with known probabilities, judged by the average alone. Real decisions also depend on risk attitude (utility), whether you can afford a long run and whether the probabilities are reliable. The roulette, lottery and insurance numbers only illustrate the mechanism and are not gambling, investment or insurance advice.
link0: → Distributions & Expectation: the mean as the balance point
link1: → Monte Carlo: estimating expectations by averaging random draws
link2: → Bandit Arms: where to bet when the probabilities are unknown
:::

Page complete. {#done .readout .success i18n=text}
