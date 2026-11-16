---
lang: en
---

::: strings
back: ← Knowledge Index
category: Investment
stage: Senior High
langLabel: Language
navLabel: Step navigation
foot: Educational demo: all numbers are fictional examples, not investment advice.
pageTitle: Fees & Compounding · How Does a 1% Fee Eat Returns
tagline: 1% sounds tiny; multiplied by 30 years of compounding, it stops being tiny.
docTitle: Fees & Compounding · How Does a 1% Fee Eat Returns
:::

## Two accounts start at 10,000, earn 5% a year — after 30 years, how far apart are they? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Guess a number first
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Guess a number first
:::

<b>This step answers: guess first, then look — a wrong guess is the learning.</b> Two accounts both start at 10,000, both earn 5% a year, both run 30 years. The only difference: one charges nothing, the other charges 1% a year (as a proportion of assets). Pick a guess first, then see the actual gap. {#s0e .explain}

::: html step0-2
s0cv: The two accounts' final values after 30 years (guess before reading the readout)
btnG0: Gap under 10%
btnG1: Gap 10%–20%
btnG2: Gap over 20%
:::

::: strings
s0ro: Actual: no fee {nf}, 1% fee {ff}, a gap of {gap} ({pct}%). {verdict}
s0vRight: You guessed right: 1% over 30 years eats about a quarter of the final value.
s0vWrong: A wrong guess is fine: 1% looks small, but after 30 years of compounding it is not.
:::

## When a 1% fee is charged, what actually changes in the formula? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 The fee comes off the return
:::

::: html step1-1
s1step: "Step 1 · "
s1k: The fee comes off the return
:::

<b>This step answers: the fee comes straight off the yearly return.</b> The compounding formula is A = P(1+r)ᵗ. A fee of f% turns r into r−f: A = P(1+r−f)ᵗ. Drag the yearly return and the fee and watch the two curves separate — and the separation widens with time, which is what the next step measures. {#s1e .explain}

::: html step1-2
s1cv: The two compounding curves with and without a fee (30 years)
lblRate: Yearly return r (%)
lblFee: Yearly fee f (%)
:::

::: strings
s1ro: r = {r}%, f = {f}%: after 30 years, no fee {nf}, with fee {ff}, a gap of {gap} ({pct}%).
lblNoFee: No fee
lblWithFee: With fee
:::

## Does the gap grow linearly or exponentially? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Time widens the gap
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Time widens the gap
:::

<b>This step answers: exponentially.</b> The gap is P(1+r)ᵗ − P(1+r−f)ᵗ; both terms are exponential, so their difference is a curve that widens ever faster. Drag the years and the fee: at 10 years the gap is still small, at 30 or 40 years it is suddenly large — the fee damages not one year but the whole compounding process. {#s2e .explain}

::: html step2-2
s2cv: The gap against years: steeper the further out you go
lblYears: Years t
:::

::: strings
s2ro: r = 5%, f = {f}%: after {t} years, no fee {nf}, with fee {ff}, a gap of {gap} ({pct}%). The longer the horizon, the larger the gap's share.
lblGap: Gap
:::

## The rate stays the same, but assets grow — what happens to the fee? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Fees scale with assets
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Fees scale with assets
:::

<b>This step answers: the absolute fee follows the assets.</b> A 1% yearly fee is a proportion, not a fixed amount: on 10,000 it is 100 a year, on 500,000 it is 5,000 a year. Drag the asset size and watch the yearly fee move — the bigger the account, the bigger the absolute amount taken each year, even though the rate never moved. {#s3e .explain}

::: html step3-2
s3cv: Yearly fee at a 1% rate, against asset size
lblAssets: Asset size
:::

::: strings
s3ro: Assets {a} at a 1% yearly fee: the yearly fee is {fee}. Double the assets, double the fee — the rate never moves, but the absolute fee follows the assets.
lblYearFee: Yearly fee
:::

## When you see a fee number, how should you read it? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Read a fee as a yearly proportion
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Read a fee as a yearly proportion
:::

<b>This step answers: read it as a yearly proportion, then multiply by time.</b> A fee number on its own does not tell you the cost; read it as “this percent of assets taken every year”, then run it over your holding period through compounding. Drag the fee (r = 5%, 30 years): 0.1% eats about 3%, 0.5% about 13%, 1% about 25%, 2% about 44%. This page teaches reading only; it recommends no product. {#s4e .explain}

::: html step4-2
s4cv: Share of the final value eaten after 30 years, against the fee
:::

::: strings
s4ro: Yearly fee {f}% (r = 5%, 30 years): the final value is {g}% smaller than with no fee — a small rate × a long time = a big gap.
:::

## Fees in three sentences {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Summary
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Summary
:::

<b>This step answers: when you see a fee, which three questions come first?</b> Ask: is it a yearly proportion or a fixed amount? Multiplied over my holding period, how much is it? After compounding magnifies it, how much is left? 1% is not 1%: over 30 years it is a quarter of the final value. {#s5e .explain}

::: html step5-2
s5cv: The points of fees: taken off returns, magnified by time, scaled with assets
recapTitle: Recap
recap1: The fee comes off the return: A = P(1+r−f)ᵗ, not a subtraction at the end.
recap2: The gap grows exponentially: small at 10 years, suddenly large at 30 or 40.
recap3: Read a fee as a yearly proportion: a 1% yearly fee eats about 25% of the final value over 30 years; bigger assets mean a bigger absolute fee.
modelTitle: Scope and limits of the model
modelText: Model: a fixed yearly return, a fixed yearly fee (as a proportion of assets), no other costs; example numbers r = 5%, 30 years. This page explains mechanisms only, is not investment advice, and recommends no product.
:::

Not investment advice: this page uses fictional examples only to explain how fees interact with compounding; it recommends no specific product and judges no real fee level. {#disclaimer .disclaimer i18n=text}

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
link0: → Compound Interest & Discounting: the full story of A = P(1+r)ᵗ
link1: → Interest Rates & Bonds: discounting is the same formula from the other side
linkSources: → Investment section sources & licences
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblStart: Start 10,000
:::
