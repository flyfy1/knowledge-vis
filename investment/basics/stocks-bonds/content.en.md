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
pageTitle: Stocks & Bonds · What Do You Actually Buy
tagline: Borrow to open a shop, or split it into shares? Behind each certificate is a completely different set of rights.
docTitle: Stocks & Bonds · What Do You Actually Buy
:::

## A fictional shop needs 1,000. What are its two options? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Two ways to raise money
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Two ways to raise money
:::

<b>This step answers: when a company raises money, what does it hand over?</b> A fictional shop wants a new oven and needs 1,000. Option one: split the shop into 100 parts at 10 each; buyers become shareholders. Option two: borrow 1,000, write an IOU, promise yearly interest and repayment of the principal at maturity. Press the two buttons to see what each certificate looks like. {#s0e .explain}

::: html step0-2
s0cv: The two certificates for raising money
btnStock: Issue shares · split ownership
btnBond: Issue a bond · write an IOU
:::

::: strings
s0roStock: Sell 100 parts at 10 each: the shop gets 1,000, and buyers become shareholders who share profits and losses by part.
s0roBond: Borrow 1,000: the shop gets 1,000 and writes an IOU promising yearly interest and repayment of the principal at maturity; the lender is not a shareholder.
:::

## What does holding 10 shares actually mean? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 A share is ownership
:::

::: html step1-1
s1step: "Step 1 · "
s1k: A share is ownership
:::

<b>This step answers: where does a shareholder's money come from?</b> The shop is cut into 100 parts; holding n parts makes you n% of the owner. When the shop earns, part of the profit can be paid out as dividends; when the shop is worth more, your parts are worth more; when it loses, your parts shrink. Drag the share count and the price per share to see your slice, your dividend and the value of your holding. {#s1e .explain}

::: html step1-2
s1cv: Your slice of the 100 parts: cyan is yours
lblShares: Shares held
lblPrice: Price per share
:::

::: strings
s1ro: Holding {sh} parts ({pct}%): the shop earned 1,000 this year and pays out half as dividends, 5 per part, so you get {div}; at {pr} per part your holding is worth {val}.
lblYourSlice: Your slice
lblRest: Other shareholders
:::

## How do the interest and principal on an IOU work? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 A bond is an IOU
:::

::: html step2-1
s2step: "Step 2 · "
s2k: A bond is an IOU
:::

<b>This step answers: what does a lender reliably receive?</b> You lend 1,000 and the IOU states: a yearly coupon (principal × coupon rate), and the 1,000 principal back in full at maturity. As long as the shop keeps paying, your cash flow is fixed; but however much the shop earns, none of its dividends are yours. Drag the coupon rate and the number of years. {#s2e .explain}

::: html step2-2
s2cv: The IOU timeline: lend 1,000 in year 0, collect a coupon each year, get the principal back at maturity
lblCouponR: Coupon rate (%)
lblYears: Years
:::

::: strings
s2ro: Lend 1,000 at a {cp}% coupon: collect {c} a year, {tot} of coupons over {y} years, plus the 1,000 principal back at maturity, {all} in total (assuming the shop pays on time).
lblLend: Lent
lblCoupon: Coupon
lblPrincipal: Principal
:::

## Only a little is left. Who is paid first, shareholders or lenders? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 When the shop is in trouble, who is paid first?
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Who is paid first
:::

<b>This step answers: why does the repayment order decide who bears risk?</b> When the shop is wound up, its assets pay the lenders first (the 1,000 IOU); only what remains goes to shareholders. If assets cover the lenders with something left over, shareholders take the remainder; if assets do not even cover the lenders, shareholders get zero and lenders recover only part. Drag the remaining assets and watch the dividing line. {#s3e .explain}

::: html step3-2
s3cv: Splitting the sale proceeds: lenders first up to 1,000, the rest to shareholders
lblAssets: Remaining assets
:::

::: strings
s3ro: Remaining assets {a}: lenders get {b} (the 1,000 IOU), shareholders get {s}. {msg}
s3msgFull: Lenders are repaid in full; the remainder goes to shareholders.
s3msgPart: Lenders recover only part; shareholders get zero.
s3msgZero: Nothing is left; both sides get zero.
lblLenders: Lenders
lblHolders: Shareholders
lblClaim: Lenders are owed 1,000
:::

## Nobody sets the price. So who does? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Why do prices move?
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Why prices move
:::

<b>This step answers: how does buy and sell willingness set a price?</b> A price is not a label the shop sticks on; it is what buyers and sellers agree. More people wanting to buy than to sell pushes the price up; the reverse pushes it down. Drag the numbers of buyers and sellers and watch the toy price move — the same mechanism the supply and demand page explains. {#s4e .explain}

::: html step4-2
s4cv: Buyers against sellers, with the toy price moving accordingly
lblBuyers: Buyers
lblSellers: Sellers
:::

::: strings
s4ro: Buyers {b}, sellers {s}: {d} more buyers than sellers, and the toy price moves from 100 to {p}. {dir}
s4dirUp: More buyers push the price up.
s4dirDown: More sellers push the price down.
s4dirFlat: Buyers and sellers balance, so the price stays put.
lblToyPrice: Toy price
:::

## One table to tell stocks from bonds {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Summary
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Summary
:::

<b>This step answers: when you meet a stock or a bond, which three questions come first?</b> Ask: did you buy ownership or a claim as a lender? Where do you stand when things go wrong? Where does the return come from? Stock: ownership, paid last, from dividends and price rises. Bond: a lender claim, paid first, from coupons and principal repayment. A price rise itself creates no value; it is only a thermometer for buy and sell willingness. {#s5e .explain}

::: html step5-2
s5cv: Stocks against bonds: identity, repayment order, source of return
recapTitle: Recap
recap1: Stock = an ownership certificate: you own by part, dividends and price moves follow your parts, and you are paid last when things go wrong.
recap2: Bond = an IOU: the lender is not an owner, collects coupons as agreed and the principal at maturity, and is paid before shareholders when things go wrong.
recap3: Price is set by buy and sell willingness: more buyers push it up, more sellers push it down; the price itself is not the shop's value, only a thermometer for trading.
modelTitle: Scope and limits of the model
modelText: Model: a fictional shop and fictional currency units; no tax, fees, trading costs or bankruptcy-law detail; share prices, dividends and coupon rates are example numbers. This page explains mechanisms only and is not investment advice.
:::

Not investment advice: this page uses fictional examples only to explain the difference between stocks and bonds; it recommends no specific product and predicts no price move. {#disclaimer .disclaimer i18n=text}

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
link0: → Supply & Demand: how buy and sell willingness sets a price
link1: → Compound Interest & Discounting: how interest grows with time
linkSources: → Investment section sources & licences
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblIdentity: Identity
lblOrder: When things go wrong
lblReturn: Return comes from
lblStockId: Shareholder · owner by part
lblBondId: Lender · not an owner
lblStockOrder: Paid last
lblBondOrder: Paid before shareholders
lblStockRet: Dividends + price rises
lblBondRet: Coupons + principal at maturity
:::
