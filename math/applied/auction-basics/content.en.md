---
lang: en
---

::: strings
back: ← Knowledge Index
category: Mathematical Foundations
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Auctions · Bidding and Telling the Truth
tagline: One item, four auction rules: why is telling the truth best in a second-price auction, while a first-price auction makes you shade your bid?
docTitle: Auctions · Bidding and Telling the Truth
:::

## If the winner pays their own bid, what bid is best? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 First price
:::

::: html step0-1
s0step: "Step 0 · "
s0k: First-price sealed bid
:::

<b>This step answers: why shouldn’t you bid your true value in a first-price auction?</b> Your value is v and your bid is b. Winning pays you v − b, losing pays 0; a higher bid wins more often but earns less each time. If the rival’s bid is uniform between 0 and 50, you win with probability b/50, so expected profit is (v − b)·b/50, peaking at b = v/2. Drag both sliders and watch the point on the orange curve. {#s0e .explain}

::: html step0-2
s0cv: Expected profit versus bid with the best bid and the current bid marked
lblV: Your value v
lblB: Your bid b
:::

## If the winner pays only the runner-up’s bid, can lying ever help? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Second price
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Second-price (Vickrey) auction
:::

<b>This step answers: why is bidding your true value never a mistake in a second-price auction?</b> The winner pays the rival’s bid r, not their own. Telling the truth (green) wins exactly when r is below v and loses when it is above, which is what you want. Any other bid b (orange) changes the outcome only when r falls between b and v (red band), and only for the worse. Drag the three sliders and check that the best possible gain is never positive. {#s1e .explain}

::: html step1-2
s1cv: Payoff against the rival’s bid for truthful bidding and for another bid
lblR: Rival bid r
:::

## Which rule earns the seller more money? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Revenue
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Revenue equivalence
:::

<b>This step answers: on average, which rule pays the seller more?</b> Each round draws n random values (uniform 0–100). In a first-price auction everyone shades to equilibrium, so the top bidder pays v₁·(n−1)/n; in a second-price auction the winner pays the second-highest value v₂. Run more rounds and both running averages settle on the same number, 100·(n−1)/(n+1): revenue equivalence. {#s2e .explain}

::: html step2-2
s2cv: Running average revenue of the two rules converging to the theoretical value
lblN: Number of bidders n
run: Run rounds
reset: Reset
:::

::: strings
pause: Pause
:::

## As the price climbs, who wins and what do they pay? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 English
:::

::: html step3-1
s3step: "Step 3 · "
s3k: English ascending auction
:::

<b>This step answers: why does an open ascending auction stop at the second-highest value?</b> The clock rises and bidders whose value is below the price drop out one by one; when a single bidder is left the auction ends, and the clock then reads exactly the second-highest value. So an English auction gives the same result as a sealed second-price auction. Press “Raise price” or “Auto” to watch who drops out. {#s3e .explain}

::: html step3-2
s3cv: Value bars for five bidders and the rising price line
raise: Raise price +5
auto: Auto raise
newDraw: New values
:::

## With the same five values, what does each of the four formats collect? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Four formats
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Four formats side by side
:::

<b>This step answers: single draws differ, but what about on average?</b> A Dutch descending auction (the price falls and the first to shout pays their own bid) is equivalent to a sealed first-price auction; English matches second-price. On one draw, v₁·(n−1)/n can land above or below v₂; over many draws the four averages move toward the same theoretical value. {#s4e .explain}

::: html step4-2
s4cv: Bars of the winning price under four auction rules for the same five values
more50: Add 50 draws
:::

::: strings
axBid: bid b
axExp: expected profit
axWin: win probability
lblValue: v
lblBest: best b = v/2
s0ro: Value {v}, bid {b}: win probability {p}%, a win pays {g}, expected profit {e}; the best bid is {bb} with expected profit {eb}.
axRival: rival bid r
axPay: your payoff
lblTruth: truthful
vNever: never better than telling the truth
vBetter: a better case exists
s1ro: Value {v}, bid {b}, rival bid {r}: your payoff {me}, the truthful payoff {tr}; best possible gain over truth {g} ({verdict}).
axCount: rounds
axRev: average revenue
rule1: first price
rule2: second price
lblTheory: theory {th}
s2ro0: n = {n}: theoretical average revenue 100·(n−1)/(n+1) = {th}. Press “Run rounds”.
s2ro: n = {n}, {c} rounds so far: first-price average {a1}, second-price average {a2}, theory {th}.
bidder: B{i}
lblPrice: price {p}
s3ro: Price {p}: {k} bidder(s) still willing.
s3roDone: Done: bidder {w} (value {v1}) wins and pays {pay}, the second-highest value.
fmt1: First price
fmt2: Second price
fmt3: English
fmt4: Dutch
s4ro: n = {n}, values (high to low): {vals}.
s4avg: Average over {c} draws (first / second / English / Dutch): {a}; theory {th}.
s4none: Press “New values” to start averaging; theoretical average {th}.
axN: bidders n
axProfit: winner’s average profit
s5ro: n = {n}, noise σ = {s}, shading {sh}: simulated average profit {m}; formula s − σ(n−1)/(n+1) = {th} ({verdict}).
vLose: the winner loses on average
vWin: the winner gains on average
:::

## When nobody knows the true value, why does the winner so often lose money? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Winner’s curse
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · winner’s curse
:::

<b>This step answers: why does the bidder with the highest estimate so often lose by winning?</b> Suppose the true value V is unknown and each bidder gets a noisy estimate V + ε. If everyone bids their estimate, the winner is the one with the largest noise ε and overpays by about σ(n−1)/(n+1) on average. More bidders and more noise make it worse. Raise the shading slider to cancel the bias, the same idea of shading as before for a different reason. {#s5e .explain}

::: html step5-2
s5cv: Bars of the winner’s average profit for different numbers of bidders
lblSig: Estimate noise σ
lblShade: Shading s
recapTitle: Recap
recap1: First price: you pay your own bid, so you shade (b = v/2 in the model); second price: telling the truth is a dominant strategy.
recap2: English matches second price and Dutch matches first price; average revenue is 100·(n−1)/(n+1) for all.
recap3: When the true value is uncertain, the highest estimate overpays by σ(n−1)/(n+1) on average, the winner’s curse; shading cancels it.
modelTitle: Scope and limits of the model
modelText: Model: one item, symmetric risk-neutral bidders, independent uniform values on 0–100; the rival bid range 0–50 is the one equilibrium requires. Real auctions have budgets, collusion, reserve prices, asymmetric or risk-averse bidders, which change the results. This page is not bidding or investment advice.
link0: → Distributions & Expectation: the weighted average behind “average revenue”
link1: → Game Theory: best responses and dominant strategies
link2: → Monte Carlo: estimating averages with many random draws
:::

Page complete. {#done .readout .success i18n=text}
