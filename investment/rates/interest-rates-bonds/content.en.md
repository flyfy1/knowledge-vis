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
pageTitle: Interest Rates & Bonds · Why Do Bond Prices Fall When Rates Rise
tagline: A bond is not a dead IOU; its present value is recalculated every time rates move.
docTitle: Interest Rates & Bonds · Why Do Bond Prices Fall When Rates Rise
:::

## What future money does one bond actually correspond to? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 A bond is a stream of cash
:::

::: html step0-1
s0step: "Step 0 · "
s0k: A bond is a stream of cash
:::

<b>This step answers: a bond is a sequence of future cash flows.</b> A toy bond: principal 1,000, coupon 5%, maturing in 5 years. The future cash is 50 in each of years 1–4, and 50 + 1,000 in year 5. A bond's price is what that stream of future cash is worth today — which is exactly what discounting, the next step, computes. {#s0e .explain}

::: html step0-2
s0cv: The toy bond's future cash flows: 50 in years 1–4, 1,050 in year 5
:::

::: strings
s0ro: One bond = a stream of future cash: 50 a year, plus the 1,000 principal at maturity, 1,250 in total before discounting.
lblCoupon: Coupon
lblPrincipal: Principal
:::

## 1,000 that waits 5 years: what is it worth today? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Discounting: what future money is worth today
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Discounting
:::

<b>This step answers: discounting is compounding run backwards.</b> Present value PV = FV / (1+r)ᵗ: take the compounding formula and run it in reverse, dividing future money by (1+r)ᵗ. The higher the rate and the longer the wait, the less it is worth today. Drag the rate and the years to see how the present value of 1,000 moves — this is the single building block of bond pricing. {#s1e .explain}

::: html step1-2
s1cv: The present value of 1,000 falling with years of waiting (at the chosen rate)
lblRate: Rate r (%)
lblYears: Years t
:::

::: strings
s1ro: 1,000 received in {t} years is worth {pv} today at r = {r}%; the higher r and the longer t, the less it is worth today.
:::

## Drag the rate: how does the whole bond's present value move? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 The rate slider and the bond's present-value curve
:::

::: html step2-1
s2step: "Step 2 · "
s2k: The rate slider
:::

<b>This step answers: when the rate rises, the whole present-value curve moves down.</b> Discount each payment of the step-0 stream (50 a year, 1,050 at maturity) and add them up, and you have the bond's present value. Drag the rate: the curve falls everywhere — at a higher rate every future payment is worth less today, so the sum is smaller. Note the point at 5%: the present value is exactly 1,000, because the coupon rate equals the rate. {#s2e .explain}

::: html step2-2
s2cv: The toy bond's present value against the rate
:::

::: strings
s2ro: At a rate of {r}%, this bond's present value is {pv} (a 5% coupon bond with principal 1,000 is worth exactly 1,000 when the rate is 5%).
lblBondPV: Bond present value
:::

## Rates rose. Why must an old bond fall in price? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Why inverse: new buyers demand the new rate
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Why inverse
:::

<b>This step answers: because new buyers will only pay at the new rate.</b> Once rates reach 8%, new bonds pay 8% and sell for 1,000. The old bond pays only a 5% coupon: sold at 1,000 it would yield just 5%, and nobody would take it — so the old bond must fall until buying it yields 8% as well. Drag the new rate and see how far the old bond's price falls. {#s3e .explain}

::: html step3-2
s3cv: The new bond (8% coupon, 1,000) against the old bond (5% coupon, fallen price)
lblNewRate: New rate (%)
:::

::: strings
s3ro: At a new rate of {r}%, the old bond (5% coupon) must fall to {p}: buying at {p} is what lets its buyer earn {r}% a year as well.
lblOldBond: Old bond price
lblNewBond: New bond price
:::

## For the same 1% rise, why does a long bond fall further? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Duration intuition: longer means more sensitive
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Duration intuition
:::

<b>This step answers: the longer money must wait, the more it fears a rate change.</b> Compare two bonds: 2-year and 10-year, both 5% coupon and 1,000 principal. When rates rise by the same amount, the 10-year bond's biggest payment (the principal) waits 10 years, so discounting hits it hardest and it falls further. This step covers direction and relative size only, not a duration formula. Drag the rate and watch the two present-value curves separate. {#s4e .explain}

::: html step4-2
s4cv: Present values of 2-year and 10-year bonds against the rate: the long one falls further
:::

::: strings
s4ro: At a rate of {r}%: the 2-year bond is worth {p2} ({d2}% against principal), the 10-year {p10} ({d10}%) — the long bond falls further.
lblShort: 2-year
lblLong: 10-year
:::

## Rates and bonds in three sentences {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Summary
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Summary
:::

<b>This step answers: when you hear “rates up, bonds down”, which three questions come first?</b> Ask: what is this bond's future cash? What is it worth discounted at the new rate? Does a longer maturity fall further? A bond price is not sentiment; it is future cash recalculated at the new rate. {#s5e .explain}

::: html step5-2
s5cv: The points of rates and bonds: discounting, the inverse move, duration intuition
recapTitle: Recap
recap1: A bond is a sequence of future cash flows; its price is each payment discounted and added up.
recap2: Rates up, price down: new buyers pay only at the new rate, so the old bond must fall until it yields the same.
recap3: Longer means more sensitive: the longer the principal must wait, the more discounting is hurt by a rate change.
modelTitle: Scope and limits of the model
modelText: Model: fixed coupons, principal repaid once at maturity, no default or tax; example bond 5% coupon, 1,000 principal; duration is qualitative intuition only, no formula applied. This page explains mechanisms only and is not investment advice.
:::

Not investment advice: this page uses fictional examples only to explain how rates relate to bond prices; it recommends no specific bond and predicts no rate move. {#disclaimer .disclaimer i18n=text}

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
link0: → Compound Interest & Discounting: the full story of PV = FV/(1+r)ᵗ
link1: → Supply & Demand: how buy and sell willingness sets a price
linkSources: → Investment section sources & licences
:::

Page complete. {#done .readout .success i18n=text}
