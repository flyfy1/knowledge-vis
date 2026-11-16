---
lang: en
---

::: strings
back: ← Knowledge Index
category: Investment
stage: Junior High
langLabel: Language
navLabel: Step navigation
foot: Educational demo: all numbers are fictional examples, not investment advice.
pageTitle: Diversification · Why Not Put All Eggs in One Basket
tagline: The number of baskets does not matter; what matters is whether they tip over together.
docTitle: Diversification · Why Not Put All Eggs in One Basket
:::

## What does the ride look like with a single asset? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One asset's swing
:::

::: html step0-1
s0step: "Step 0 · "
s0k: One asset's swing
:::

<b>This step answers: how bumpy is a single asset?</b> A toy asset moves up and down each period with a volatility (standard deviation) of 20%. Over 20 periods the path swings widely: the endpoint can sit far above or far below the start. Press “run again” for another path — the path changes, but the size of the swings does not. {#s0e .explain}

::: html step0-2
s0cv: A toy asset's price path over 20 periods (volatility 20%)
btnAgain: Run again
:::

::: strings
s0ro: After 20 periods the endpoint is {end} (started at 100): a single asset's ride is bumpy and the endpoint depends heavily on luck.
:::

## Holding two assets together, why does the volatility change? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The correlation slider
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The correlation slider
:::

<b>This step answers: the portfolio's volatility is decided by correlation.</b> Two assets each swing 20%, held half and half. Portfolio volatility is σ_p = √(w1²σ1² + w2²σ2² + 2w1w2ρσ1σ2), which at equal weights is 20% × √((1+ρ)/2). Drag the correlation ρ: at ρ = 1 the portfolio still swings 20%; at ρ = 0 it falls to about 14%; at ρ = −1 it falls all the way to 0 — two opposite assets cancel each other out. {#s1e .explain}

::: html step1-2
s1cv: Two assets (cyan, orange) and the portfolio (green): the portfolio flattens as ρ falls
lblRho: Correlation ρ
:::

::: strings
s1ro: ρ = {rho}: two assets each swinging 20%, held half and half, give a portfolio volatility of {sp}% (20% × √((1+ρ)/2)). {msg}
s1msg1: Moving together, diversification achieves nothing.
s1msg0: Unrelated, and the volatility is already smaller.
s1msgMid: Partly correlated, and the volatility falls partway.
s1msgNeg: Moving oppositely, the swings cancel out.
:::

## How do ten assets that move together differ from one? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Count is not the point
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Count is not the point
:::

<b>This step answers: the point is correlation, not count.</b> Ten assets that rise and fall together trace almost the same portfolio path as any one of them: 10 ≈ 1. Ten assets each going their own way trace a visibly smoother portfolio path. Press the two buttons to compare — more baskets is not diversification; what diversifies is the direction of movement. {#s2e .explain}

::: html step2-2
s2cv: Ten asset paths and the portfolio: together they still swing, apart they flatten
btnTogether: Ten moving together
btnApart: Ten going their own ways
:::

::: strings
s2ro: {mode}: the portfolio's volatility over 20 periods is about {sp}% (a single asset: 20%). {msg}
s2modeT: Ten moving together
s2modeA: Ten going their own ways
s2msgT: No matter the count, moving together is the same as one.
s2msgA: Going their own ways, much of the swing is averaged away.
:::

## How is diversification different from insurance pooling? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Not the same as insurance pooling
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Not the same as insurance pooling
:::

<b>This step answers: they look at different things, so the mechanisms differ.</b> Insurance looks at independence: many people facing independent risks average out to something stable, and the 1/√N intuition says more people means a steadier average. Investment looks at low correlation: the more differently assets move, the steadier the portfolio. The 1/√N intuition is shared (averaging smooths swings) but the mechanism differs — it is not re-derived here; see the risk pooling page for detail. {#s3e .explain}

::: html step3-2
s3cv: Left: insurance — the average of independent events steadies. Right: investment — a low-correlation portfolio flattens.
:::

::: strings
s3ro: Insurance looks at independence, investment at low correlation: the 1/√N intuition is shared, the mechanism differs.
:::

## As you keep adding assets, can volatility fall to zero? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 The part diversification cannot remove
:::

::: html step4-1
s4step: "Step 4 · "
s4k: The part diversification cannot remove
:::

<b>This step answers: no — part of the risk is systematic.</b> Each asset's swing splits in two: idiosyncratic risk (that company's own business) and systematic risk (the whole market moving together). Idiosyncratic risk shrinks as 1/√n with the number of assets n; systematic risk is a floor that diversification cannot remove. Drag the asset count and watch the curve settle on the 10% floor and go no lower. {#s4e .explain}

::: html step4-2
s4cv: Portfolio volatility falls with asset count, settling on the 10% systematic floor
lblCount: Number of assets n
:::

::: strings
s4ro: n = {n}: idiosyncratic risk about {idio}%, the systematic floor 10%, portfolio volatility about {tot}% — adding more assets never goes below 10%.
:::

## Diversification in three sentences {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Summary
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Summary
:::

<b>This step answers: when you hear “diversify”, which three questions come first?</b> Ask: do they move in the same direction? Is the count a disguise or real diversification? Can you accept the systematic risk that remains? Diversification smooths individual swings; it cannot smooth the part where the whole market moves together. {#s5e .explain}

::: html step5-2
s5cv: The points of diversification: low correlation, real count, systematic floor
recapTitle: Recap
recap1: Portfolio volatility is decided by correlation: at ρ = 1 it equals a single asset, at ρ = 0 about 14%, at ρ = −1 zero (equal weights, 20% each).
recap2: The point is correlation, not count: ten assets moving together are about equal to one.
recap3: Systematic risk is a floor: idiosyncratic risk shrinks as 1/√n, but the part where the whole market moves together cannot be diversified away.
modelTitle: Scope and limits of the model
modelText: Model: toy assets, equal weights, fixed 20% volatility and a 10% systematic floor are all examples; no trading costs, tax or real correlation estimation. This page explains mechanisms only and is not investment advice.
:::

Not investment advice: this page uses fictional examples only to explain how diversification works; it recommends no specific asset or portfolio. {#disclaimer .disclaimer i18n=text}

::: html step5-3
licH1: Source
licH2: Note
licR1a: Definitions and explanations
licR1b: Original to this site, rewritten from concept knowledge; no textbook text copied.
licR2a: Investor.gov term alignment
licR2b: Terms checked against Investor.gov only; Chinese renderings are marked as translated from Investor.gov; no SEC endorsement is implied.
licR3a: OpenStax / Saylor / Khan Academy
licR3b: Textbook text not used; structure checked against concept lists only, zero sentences quoted.
licR4a: Wikidata
licR4b: Structured data only (items and properties); no article text quoted.
licR5a: Numbers
licR5b: All hand-set example numbers; no real quotes, companies or securities.
link0: → Distributions & Variance: how spread is measured
link1: → Risk Pooling: where insurance's 1/√N comes from
linkInv: → Investor.gov: Asset Allocation and Diversification (source text, English)
linkSources: → Investment section sources & licences
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblSingle: Single asset
lblPortfolio: Portfolio
lblFloor: Systematic floor 10%
:::
