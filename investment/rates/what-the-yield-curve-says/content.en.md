---
lang: en
title: What the Yield Curve Says · A Hands-on Essay
desc: Line up one borrower's one-, two- … ten-year interest rates and you get a curve the news calls “inverted”, “steepening” or “a recession signal”. Starting from zero-coupon bonds, this essay separates forward rates, expectations and the term premium, then covers duration, convexity, the three ways a curve moves and why it inverts, and moves on to corporate bonds: default probability, recovery, credit spreads and why junk-bond defaults cluster, ending with what the curve actually did in 2022–2026. Twelve hands-on models; mechanisms only, not investment advice.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
ctl.date: Which day's curve
dt.a: 2021-12-31
dt.b: 2023-06-30
dt.c: 2026-11-23
u.pct: {v}%
u.pt: {v} percentage points
u.bp: {v} basis points
u.yr: {v} years
u.ym: {y}-{m}
u.x: {v} times
:::

# What the Yield Curve Says {#hero}

::: strings
kicker: Investment · Interest rates · A hands-on long essay
:::

Why is a line through a dozen interest rates<br>read as the market's “weather forecast”? {.sub}

Open any financial website and you will find a chart. The horizontal axis runs from one year, two years, five years and ten years out to thirty years. The vertical axis is the US Treasury yield at each of those maturities. Join the points and you have the **yield curve**. The news says it has “inverted”, that it has “steepened”, or that “the 10-year yield has climbed to 5%”. This essay asks only one question: **what does each point on this curve actually say?** Which part is the market's expectation of future interest rates? Which part is the payment for lending money for a long time? Which part is worry that the borrower will not pay? Chapters 1–5 take the curve apart: zero-coupon bonds, forward rates, expectations and the term premium, and why the term premium can only be estimated. Chapters 6–9 cover how the curve moves, who loses when it moves, and why it inverts. Chapters 10–11 leave government bonds and cover the extra yield that corporate bonds pay. Chapter 12 is what the curve actually did from 2022 to 2026, and Chapter 13 gives five questions to ask when you read a curve. {.lead}

Prerequisites: why a bond's price and yield move in opposite directions is in [[interest-rates-bonds]]; how a single sum is discounted is in [[compound-interest]]. How a central bank sets the short-term rate, how a rate hike passes through to the economy, and the full record of inversions and US recessions are already covered in the longer essay [[why-one-rate-moves-everything]]; here it is linked only where needed. The data come from the Federal Reserve Economic Data (FRED) database, the Federal Reserve Bank of New York and S&P Global Ratings, and every figure is dated. **This essay explains mechanisms only. It is not investment advice and it does not forecast interest rates.** The essay was written by AI. Each model is a real tool from textbooks or research, only on a smaller scale; the last paragraph of each chapter says what it leaves out. {.note}

## The atoms of the curve: zero-coupon bonds {#ch1}

::: strings
toc: Zero-coupon bonds
:::

Any bond that pays a coupon each year can be split into a string of zero-coupon bonds, each of which pays a single sum on a single date. The raw material of the curve is the interest rates on these zero-coupon bonds; the yield reported in the news is a weighted average of them. {.law}

Discounting itself (what tomorrow's money is worth today) is in [[why-one-rate-moves-everything#ch1|Why One Central-Bank Rate Moves the Price of Everything, Chapter 1]], and spot rates, forward rates and bootstrapping are in its [[why-one-rate-moves-everything#ch3|Chapter 3]]. This chapter does one thing: it takes a coupon bond apart to show how the coupon pulls its “yield” away from the zero rate. A 10-year bond paying a $6 coupon each year is really 11 promises: ten coupons of $6 (years 1 to 10) plus $100 of principal in year 10. These 11 payments fall due at different times, so there is no reason to discount them all at one rate. Sell them separately and each one becomes a **zero-coupon bond** that pays a single sum on a single date. The US Treasury really does allow this splitting (the STRIPS program).

::: diagram dg-strips keys=dg.strips
cap: Figure 1. A 5-year coupon bond (top) split into 5 zero-coupon bonds (bottom), each discounted at the zero-coupon rate z for its own maturity. Schematic, not to scale.
aria: Schematic: a bond that pays a coupon each year and its principal in year five, split into five zero-coupon bonds that mature in years one to five
top: 5-year bond
split: Split
bot: 5 zero-coupon bonds
yrs: Year
:::

The price of a zero-coupon bond and its rate are linked by one formula. Chapters 1–4, Chapter 7 and Chapter 10 of this essay all use continuous compounding, the standard way researchers estimate the curve. It makes forward rates the cleanest to compute:

P(t) = e<sup>−z(t)·t</sup>  coupon bond price = Σ CF<sub>t</sub> · e<sup>−z(t)·t</sup>  yield to maturity y solves Σ CF<sub>t</sub> · e<sup>−y·t</sup> = price {#eq .formula}

z(t) is the t-year zero-coupon rate, also called the **spot rate**. Taken together across all maturities, the zero rates form the cleanest yield curve. The model below uses a set of zero-coupon rates that the New York Fed publishes every day. They come from fitting the US Treasury curve with the model of Adrian, Crump and Moench (2013), known as ACM, with one point for each year from 1 to 10.

::: lab ch1-model
model.title: Take a bond apart into zero-coupon bonds
model.how: Pick a date, then drag the maturity and the coupon. The cyan line is that day's zero-coupon rate curve; each point is the rate used to discount one cash flow. The gold dashed line is the bond's yield to maturity. The lower chart shows each cash flow's present value as a share of the bond's price. Compare the gold line with the last cyan point.
ctl.t: Maturity
ctl.c: Annual coupon
leg.z: Zero-coupon rate z(t)
leg.y: Yield to maturity y
cv.x: Year →
cv.y: ↑ Rate (%)
cv.y2: ↑ Share of price
cv.aria: Line chart: the zero-coupon rate curve on the chosen date, the rate applied to each cash flow, and the bond's yield to maturity
cv.aria2: Bar chart: the present value of each cash flow as a share of the bond's price
read.p: Price (per 100 dollars face value)
read.y: Yield to maturity
read.z: Zero-coupon rate of the same maturity
read.gap: Difference
say.below: The yield to maturity {y} is {g} below the {T}-year zero-coupon rate of {z}. When the curve slopes upward, the early coupons are discounted at lower short rates, which pulls the average down. The final payment is {w} of the price.
say.above: The yield to maturity {y} is {g} above the {T}-year zero-coupon rate of {z}. When the curve is inverted, the early coupons are discounted at higher short rates, which pulls the average up. The final payment is {w} of the price.
say.zero: The yield to maturity {y} and the {T}-year zero-coupon rate {z} are almost identical. With a zero coupon (or a flat curve), the whole bond has only one rate.
:::

By default this is the curve for 23 November 2026. For a 10-year bond with a 6% coupon, the yield to maturity is {=ch1.y}, while the 10-year zero-coupon rate is {=ch1.z}, a gap of {=ch1.gapC} basis points (1 basis point is 0.01 percentage points). Move back to the end of 2021 and the gap is {=ch1.gapA} basis points. Move to the end of June 2023, when the curve was inverted, and the gap becomes {=ch1.gapB} basis points, in the other direction. Drag the coupon to zero and the gap disappears: a zero-coupon bond's yield is its zero-coupon rate.

This is the **coupon effect**. Two bonds with the same maturity but different coupons have different yields, even from the same issuer. So the “10-year Treasury yield” is a conventional average; the true “10-year rate” is z(10). The Treasury's published “par yield” curve is also such an average. How to work backward from par yields to zero-coupon rates, year by year (bootstrapping), is covered by a model in [[why-one-rate-moves-everything#ch3|Why One Central-Bank Rate Moves the Price of Everything, Chapter 3]], and is not repeated here.

Limits of the model: coupons are paid once a year (US Treasuries actually pay twice a year); zero-coupon rates under one year take the one-year value, and rates between one and ten years are linearly interpolated; ACM goes only to ten years. The ACM zero-coupon rates are themselves smoothed fitted curves, not quotes on any real bond. {.take}

## Forward rates: the next year's rate you can lock in today {#ch2}

::: strings
toc: Forward rates
:::

Compare two zero-coupon rates and you get a **forward rate**: a borrowing rate for some future period that you can lock in today. It falls out of arithmetic, and anyone can build it from two zero-coupon bonds. {.law}

Spot and forward rates are defined in [[why-one-rate-moves-everything#ch3|Why One Central-Bank Rate Moves the Price of Everything, Chapter 3]]; this chapter is about actually locking a forward rate in, and the arbitrage when a quote strays. Suppose you want to lend money two years from now, for three years. Do you need to know the rate in two years? No. Today, buy a 5-year zero-coupon bond and short-sell a 2-year zero-coupon bond, in quantities that cost nothing today. In two years you pay out a sum (the short 2-year bond matures). In five years you collect a sum (the 5-year bond you bought matures). The return from year 2 to year 5 is already locked in.

::: diagram dg-fwd keys=dg.fwd
cap: Figure 2. Two routes from today to t₂: buy a t₂-year zero-coupon bond directly, or buy a t₁-year bond first and then roll over at the forward rate f to t₂. With no arbitrage, both routes end at the same point, and f is fixed by the two zero rates.
aria: Schematic: a timeline from zero to t1 to t2. One route goes straight to t2; the other goes to t1, then on to t2 at the forward rate
a: Buy t₂-year zero
b1: Buy t₁-year zero
b2: Roll at f to t₂
eq: z₂·t₂ = z₁·t₁ + f·(t₂ − t₁)
:::

Both routes end at the same point, so their returns must be equal, and therefore:

f(t₁, t₂) = (z₂·t₂ − z₁·t₁) / (t₂ − t₁) {#eq .formula}

The forward rate is the marginal stretch. The spot rate z₂ is the average from today to t₂, and the forward rate is the piece that this average newly adds after t₁. When the average rises, the newly added stretch must be above the average; when the average falls, the newly added stretch must be below it.

::: lab ch2-model
model.title: Extract forward rates from the zero-coupon curve
model.how: Pick the dates and drag t₁ and t₂. The purple segment is the locked-in forward rate. Then drag “a forward rate someone quotes you” (the white dashed line). Whenever it differs from the purple line, the panel below sets out a riskless strategy and how much it earns at t₂. The gold steps show the one-year forward rate for each year.
ctl.t1: From year (t₁)
ctl.t2: To year (t₂)
ctl.q: Forward rate someone quotes you
leg.z: Zero-coupon rate
leg.f: One-year forward rate
leg.sel: Locked-in forward rate, t₁ → t₂
cv.x: Year →
cv.y: ↑ Rate (%)
cv.aria: Line chart: the zero-coupon curve, the one-year forward rate for each year, and the forward rate for the chosen interval, together with the quote from the other party
read.z1: t₁-year zero-coupon rate
read.z2: t₂-year zero-coupon rate
read.f: Forward rate f
read.units: Short t₁-year zeros per 1 t₂-year zero bought
read.profit: Arbitrage profit (per 100 dollars, at t₂)
say.lend: The quote {q} is above the forward rate {f}. Lend 100 dollars in year {a} at the quoted rate, and use zero-coupon bonds to “borrow” the same sum (buy {a}-year zeros and short {b}-year zeros of equal market value today). By year {b} you net {p} dollars, without spending a cent today.
say.borrow: The quote {q} is below the forward rate {f}. Borrow 100 dollars in year {a} at the quoted rate, and use zero-coupon bonds to “lend” the same sum (buy one {b}-year zero and short {u} {a}-year zeros, with face values of 100). By year {b} you net {p} dollars.
say.none: The quote equals the forward rate {f}, so there is no free money. This is where forward quotes in the market sit.
:::

By default, for 23 November 2026, the 2-year zero-coupon rate is {=ch2.z2}, the 5-year is {=ch2.z5}, and the forward rate from year 2 to year 5 is {=ch2.f}. The strategy is: for each 1 dollar of face value of the 5-year zero you buy, short {=ch2.units} dollars of face value of the 2-year zero. That locks in lending. If someone is willing to borrow this money from you at 5.5%, do the reverse: lend to them at 5.5% and, at the same time, buy the 2-year zero and short the 5-year zero to borrow the same sum at {=ch2.f}. You lock in {=ch2.arb} dollars per 100 dollars in year 5. As soon as such an opportunity appears, traders push the quote back, so the forward rate sits almost exactly where the curve puts it. Forward quotes in interest-rate swap and futures markets rest on this same arithmetic.

On the same day, the one-year forward rate for years 9 to 10 is {=ch2.f910}, above the 10-year zero-coupon rate of {=ch2.z10}, because the curve slopes upward. Move to the end of June 2023: the one-year rate is {=ch2.zB1}, but the one-year forward rate for year 4 is only {=ch2.fB34}. When the curve is inverted, forward rates fall faster than spot rates at the short end.

Limits of the model: the no-arbitrage argument assumes you can buy, sell and short zero-coupon bonds freely, with no transaction costs. In reality there are bid–ask spreads and funding costs, so forward quotes sit in a narrow band around the position the curve gives. This chapter shows only that forward rates can be **locked in**. It does not show that they are a **forecast** of the future; that is the question of the next two chapters. {.take}

## Building a curve from expectations and a term premium {#ch3}

::: strings
toc: Expectations plus term premium
:::

Long-term rate = the average of expected future short rates + the term premium. The shape of the curve is set by both parts together, and the same curve can be assembled from many different combinations of “expectation + premium”. {.law}

You can lend someone money for 10 years with one 10-year contract, or lend for one year at a time and roll over ten times. If an investor cares only about the average return, the two approaches should have the same expected return, so the 10-year rate equals the average of the short rates expected over the next ten years. This is the **expectations hypothesis**. But locking money up for ten years in one go means that when interest rates or inflation change midway, the price of the bond in hand changes with them (Chapter 6). To bear that risk, investors usually demand extra compensation, called the **term premium**.

::: diagram dg-stack keys=dg.stack
cap: Figure 3. The yield for each maturity split into two layers: the average expected short rate (cyan) plus the term premium (purple). The numbers come from the “cuts ahead” preset in the model below, with a 10-year term premium of 0.8 percentage points.
aria: Stacked bar chart: yields for 1, 2, 3, 5, 7 and 10-year maturities, each made of two layers, the average expected short rate and the term premium
exp: Cyan: expected short rate (average)
tp: Purple: term premium
x: Maturity (years)
y: Rate (%)
:::

Written as a formula (continuous compounding, averaged by year):

y<sub>n</sub> = (1/n) · Σ<sub>k=0..n−1</sub> E[i<sub>k</sub>] + TP<sub>n</sub>  forward rate f<sub>n−1→n</sub> = E[i<sub>n−1</sub>] + (term premium added in year n) {#eq .formula}

i<sub>k</sub> is the one-year short rate in year k, and E[·] is today's expectation of it. The model below lets you set the expected path one year at a time. The term premium is set to rise linearly with maturity, reaching TP<sub>10</sub> at ten years.

::: lab ch3-model
model.title: Curve builder: an expected path plus a term premium
model.how: First choose a preset, or drag the purple steps directly on the chart (the “year” and “expected short rate” sliders also change them one year at a time). The cyan dashed line is the yield implied by expectations alone; the gold line is the curve after adding the term premium. In the second part, another person thinks the term premium is a different number. What expected path (the green line) would they read from the same gold line?
ctl.preset: Preset path
p.cuts: Cuts ahead
p.flat: Flat
p.hikes: Hikes ahead
ctl.k: Year
ctl.v: Expected short rate in that year
ctl.tp: 10-year term premium
ctl.b: Term premium the other person assumes for the 10-year
u.year: Year {a}–{b}
leg.path: Expected one-year short rate
leg.exp: Yield from expectations alone
leg.y: Expectations + term premium = yield curve
leg.pathB: Expected path read by the other person
cv.x: Maturity / year ahead →
cv.y: ↑ Rate (%)
cv.aria: Chart: the expected one-year short rate path, one point per year; the yield curve from expectations alone; and the yield curve with the term premium added
cv.aria2: Chart: the same yield curve, with the two expected short-rate paths read off under two term-premium assumptions
read.y1: 1-year yield
read.y10: 10-year yield
read.s: 10-year minus 1-year
read.tp: Term premium within the 10-year
read.a10: Your path: expected rates in years 9–10
read.b10: The path they read: expected rates in years 9–10
read.same: 10-year yield both of you see
say.inv: The curve is inverted; 10-year minus 1-year is {s}. The expectations part contributes {e} (the market expects short rates to fall), and the term premium, pushing the other way, adds {tp}. That is not enough to offset it.
say.up: The curve slopes upward; 10-year minus 1-year is {s}. The expectations part contributes {e}, and the term premium contributes {tp}.
say.flat: The curve is almost flat. The expectations part {e} and the term premium {tp} cancel out almost exactly.
sayB.diff: Same curve (10-year at {y}), but you assume a term premium of {a} and they assume {b}. The expected rates they read for years 9–10 differ from yours by {g}. From the curve alone, you cannot tell who is right.
sayB.same: Your term-premium assumptions are the same, so the expected paths you read are also the same.
:::

The default is “cuts ahead”: the short rate today is 5.25%, it falls to 3% over four years, then stays there; the 10-year term premium is 0.8 percentage points. The curve is inverted: the 1-year yield is {=ch3.y1} and the 10-year yield is {=ch3.y10}, a difference of {=ch3.s} percentage points. Of this, the expectations part contributes {=ch3.e} and the term premium contributes {=ch3.tp}. With “hikes ahead”, the same term premium gives a curve that slopes steeply upward, with 10-year minus 1-year at {=ch3.hs} percentage points.

The second part of the model is the point of this chapter. The curve is visible; expectations and the premium are not; only their sum can be observed. If you assume the term premium is +0.8, your path gives expected rates of {=ch3.pA9} in years 9–10. Another person assumes −0.5, and from the **same curve** the expected rates they read for years 9–10 are {=ch3.pB9}, and for years 4–5 they are already {=ch3.pB4}. The equation has two unknowns and one equation. To separate them you must add assumptions: how short rates move, and what rule governs the premium investors demand. This is why the two official models in Chapter 5 give different answers.

Limits of the model: the term premium rises linearly with maturity, a shape chosen to make the mechanism visible; the real term-premium curve changes shape. The formula also leaves out a “convexity bias”: the more rates fluctuate, the more a long zero-coupon bond's yield is pushed down (convexity, Chapter 7). On the 10-year it is usually a few to a dozen basis points. {.take}

## Forwards are not forecasts: what you earn from holding for a year {#ch4}

::: strings
toc: Forwards are not forecasts
:::

If next year the curve moves exactly to the forward rates, a long bond earns the same as a one-year bond. If next year the curve stays unchanged, the long bond's return is that forward rate. The forward rate is a break-even point, not a forecast. {.law}

Buy a 10-year zero-coupon bond and sell it a year later. When you sell it, it is a 9-year bond, and its price depends on the 9-year rate at that time. The return for that year (continuously compounded) is:

Return = n·y<sub>n</sub> (today) − (n−1)·y<sub>n−1</sub> (one year later) {#eq .formula}

Two special cases of “one year later” are useful. First, the curve moves exactly along today's forward rates. Substitute, and the return equals today's one-year rate, no more and no less. This is what the arbitrage of Chapter 2 forces: the forward rate is the line where the long and short strategies break even. Second, the curve stays completely unchanged. Substitute, and the return equals the forward rate from year n−1 to year n. When the curve slopes upward, this is above the n-year yield. The excess is called **roll-down**: the bond gets a year older and slides from a higher point on the curve to a lower one, so its price rises a little.

::: lab ch4-model
model.title: Buy a zero-coupon bond and hold it for a year
model.how: Choose a date and a maturity, then choose the curve one year later: unchanged, following forward rates, or shifted in parallel (drag the shift). The cyan line is today's curve; the gold dashed line is the curve a year later; the white line shows where your bond sits after rolling from n years to n−1 years. Compare the return with the one-year rate.
ctl.n: Maturity of the zero-coupon bond bought
ctl.s: Curve one year later
s.same: Unchanged
s.fwd: Follows forward rates
s.shift: Parallel shift
ctl.x: Size of shift
leg.now: Today's zero-coupon curve
leg.next: Curve one year later
cv.x: Maturity (years) →
cv.y: ↑ Rate (%)
cv.aria: Line chart: today's zero-coupon curve and the curve one year later, with the position of the held bond rolling from n years to n−1 years
read.ret: One-year return from holding
read.r1: One-year rate over the same period
read.ex: Excess return
read.be: Parallel rise that wipes out the excess
say.same: Curve unchanged: the one-year return on the {n}-year zero-coupon bond is {r}, the one-year rate is {r1}, and the excess return is {e}, of which roll-down contributes {roll}. If all rates rise in parallel by {be} over the year, the excess return goes to zero.
say.fwd: The curve follows forward rates: the return is {r}, exactly equal to the one-year rate {r1}. The forward rate is this break-even point.
say.shift: The curve shifts in parallel: the return is {r}, the one-year rate is {r1}, and the excess return is {e}. The break-even is a parallel move of {be}.
:::

By default, for 23 November 2026: if the curve is unchanged for a year, a 10-year zero-coupon bond returns {=ch4.ret}, the one-year rate is {=ch4.r1}, and the excess return is {=ch4.ex} percentage points. But if all rates rise by about {=ch4.be} basis points over the year, that excess disappears. The curve at the end of June 2023 was inverted. With the same method, a 10-year bond's one-year return was only {=ch4.retB}, while the one-year rate was {=ch4.r1B}, an excess return of {=ch4.exB} percentage points. When the curve is inverted, holding the long bond needs rates to fall in order to beat the short one.

The expectations hypothesis says that, on average, the excess return should be zero. What do the data say? Using ACM zero-coupon rates from 1962 onward, the chart below buys a 10-year zero-coupon bond each January, sells it a year later, subtracts the one-year rate over the same period, and works out the real excess return for each year.

::: lab ch4-rx keys=ch4.rx
title: Each year's excess return on 10-year zero-coupon Treasuries, 1962–2025
how: Each bar is one year (January to the following January) and shows how many percentage points more, or less, you earned by holding a 10-year zero-coupon Treasury instead of a one-year. Choose a start year, then look at the average, the volatility and how many years paid.
ctl: Start from which year
p62: From 1962
p90: From 1990
p08: From 2008
leg.pos: Gain
leg.neg: Loss
leg.mean: Average
x: Start year of holding →
y: ↑ Excess return (percentage points)
aria: Bar chart: for each year from 1962 to 2025, the excess return from holding a 10-year zero-coupon Treasury relative to a one-year
read.mean: Average excess return
read.sd: Standard deviation
read.pos: Years that paid
read.worst: Worst year
worstv: {v} ({y})
say: In the {n} years from {a} to {b}, the average annual excess return was {m}, but the standard deviation was {sd} percentage points, and only {p} of the years were positive. A positive average shows that long bonds do pay a premium; such volatility shows you have to take real risk to collect it.
:::

Over the 64 years since 1962, the average annual excess return was {=ch4.m62} percentage points, with a standard deviation of about {=ch4.sd62} percentage points, and only {=ch4.pos62} of the years paid. The worst was the holding period starting in {=ch4.wy62}, with an excess return of {=ch4.w62} percentage points; the one starting in 2022 was {=ch4.x22}. Since 1990 the average has been {=ch4.m90}, with {=ch4.pos90} of the years paying. That is far above the monthly average of the 10-year term premium estimated by ACM since 1990 ({=ch4.tp90}). Over these three decades yields trended down, so a large part of the after-the-fact return was a windfall, not compensation investors had asked for in advance.

Note that these 64 annual numbers alone are a small sample: the average of {=ch4.m62} is only about 1.4 standard errors from zero ({=ch4.sd62} ÷ √64), not enough on its own to show that the term premium is positive; see [[numbers-lie#c2|small samples in Every Number Was True, and the Conclusion Was Still Wrong]]. The firmer evidence is of another kind: Fama and Bliss (1987) and Campbell and Shiller (1991) found that the steeper the curve, the higher the subsequent average excess return, so forward rates are not unbiased predictors of future rates, contrary to an expectations hypothesis with a constant premium. How much of this predictability is real, and how much is produced by the few large rate cycles in the sample, is still debated among scholars. {.take}

## The term premium: unseen, only estimable {#ch5}

::: strings
toc: Where the term premium comes from
:::

The term premium is the price long bonds charge for bearing interest-rate risk. It can be high or negative. It cannot be seen, only estimated by models, and two official models can differ by more than two percentage points. {.law}

Why would anyone accept a negative term premium? Think of someone worried about a stock-market crash. If, when the economy gets worse, rates tend to fall and long bonds rise in price, then long bonds are like insurance: they pay out when stocks lose. Insurance costs money, so in such a world the term premium on long bonds can be negative. From the 2000s to 2020, stocks and Treasuries mostly moved in opposite directions, which is roughly how it looked. Conversely, if the biggest fear is runaway inflation, stocks and long bonds fall together in bad years. Long bonds stop being insurance, and the term premium has to rise. The 1970s–80s and 2022 look more like this case. Who buys, and how much, also moves it: when a central bank buys long bonds (quantitative easing), the premium is pushed down; when governments issue a lot, it is pushed up. See [[why-one-rate-moves-everything#ch10|Why One Central-Bank Rate Moves the Price of Everything, Chapter 10]].

The two most cited estimates are the New York Fed's ACM model and the Federal Reserve Board's Kim–Wright model. Both split the yield into “the average expected short rate” and “the term premium”, but they make different assumptions about how short rates move (Kim–Wright also uses survey forecasts of rates). The chart below sets ACM's split alongside Kim–Wright's term premium.

::: lab ch5-model
model.title: 10-year Treasury yield, split into expectations and term premium (1990–2026)
model.how: Drag the month. The gold line is the ACM-fitted 10-year zero-coupon yield; the cyan line is its “average expected short rate” part; the purple line is ACM's term premium; the green dashed line is the Kim–Wright term premium. Look at when the two term premiums are furthest apart.
ctl.m: Month
leg.y: 10-year yield (ACM fit)
leg.exp: Of which: average expected short rate (ACM)
leg.acm: Term premium (ACM)
leg.kw: Term premium (Kim–Wright)
cv.x: Year →
cv.y: ↑ Rate (%)
cv.aria: Line chart: from 1990 to 2026, the 10-year yield, its expectations part, the ACM term premium and the Kim–Wright term premium
read.y: 10-year yield
read.exp: Expectations part (ACM)
read.acm: Term premium (ACM)
read.kw: Term premium (Kim–Wright)
say.pos: {d}: the 10-year yield is {y}. ACM says {e} of it is the average expected short rate and the term premium is {a}. The Kim–Wright term premium is {k}, and the two models differ by {g}.
say.neg: {d}: the term premium is negative (ACM {a}, Kim–Wright {k}). Investors holding long Treasuries accept less return than they would from rolling short bonds. The 10-year yield is {y}, with an expectations part of {e}.
:::

The two term-premium lines move in similar ways (monthly correlation {=ch5.corr}), but their levels differ a good deal, by as much as {=ch5.md} percentage points. Since 1990, ACM's estimate peaked at {=ch5.max} ({=ch5.maxD}) and bottomed at {=ch5.min} ({=ch5.minD}). Kim–Wright peaked at {=ch5.kmax} ({=ch5.kmaxD}) and bottomed at {=ch5.kmin} ({=ch5.kminD}). Both models agree that the term premium fell from its 1990s highs to a trough at the pandemic in 2020, and has since returned to positive values. The latest readings: ACM on 23 November 2026 is {=ch5.acm} (that day's fitted 10-year yield was {=ch5.y10}, of which the expectations part was {=ch5.exp}); Kim–Wright on 20 November 2026 is {=ch5.kw}.

Limits of the model: this chapter has no model of its own. It shows the output of two institutional models. Both figures are estimates, not observations, and Chapter 3 already showed why: the same curve can be split into many “expectation + premium” combinations. When you read that “the term premium has risen”, ask which model said so. {.take}

## Duration: one number for interest-rate risk {#ch6}

::: strings
toc: Duration and DV01
:::

A bond's sensitivity to rates can be summed up in one number: duration. It is the present-value-weighted average waiting time of the bond's cash flows. For each 1 percentage point rise in rates, the price falls by about the modified duration, in percent. {.law}

Duration and convexity as concepts are covered in [[why-one-rate-moves-everything#ch2|Why One Central-Bank Rate Moves the Price of Everything, Chapter 2]]; this chapter adds DV01 and how wrong the approximation gets. The intuition for why an old bond must fall when rates rise is in [[interest-rates-bonds#step3|Interest Rates & Bonds, Step 3]], and why long bonds fall further is in its Step 4. What is needed here is a number you can calculate. Think of the present value of each cash flow as a brick on a seesaw, placed at the year it falls due. The balance point of the seesaw is the **Macaulay duration**.

::: diagram dg-seesaw keys=dg.seesaw
cap: Figure 4. A 10-year bond with a 4% coupon and a 4% yield. Each brick is the present value of one cash flow, placed at the year it falls due. The seesaw balances at {=ch6.mac} years, the Macaulay duration. Brick heights are computed by the page's model.
aria: Schematic: ten bricks on a timeline, representing the present values of the cash flows, the last one largest, with the balance point at about 8.4 years
bar: Brick size = present value of that year's cash flow
pivot: Pivot: {=ch6.mac} years
x: Year
:::

This chapter follows the market convention of annual compounding:

P = Σ CF<sub>t</sub>/(1+y)<sup>t</sup>  D<sub>mac</sub> = Σ t·PV<sub>t</sub> / P  D<sub>mod</sub> = D<sub>mac</sub>/(1+y)  DV01 = D<sub>mod</sub>·P·0.0001<br>ΔP/P ≈ −D<sub>mod</sub>·Δy + ½·Convexity·(Δy)<sup>2</sup>  Convexity = Σ t(t+1)·PV<sub>t</sub> / (P(1+y)<sup>2</sup>) {#eq .formula}

**DV01** is the version traders use most. It is how many dollars per 100 dollars of face value the bond loses when its yield rises by 1 basis point. A few rules can be read straight off the formulas. A zero-coupon bond's Macaulay duration is its maturity, since all the bricks sit in the last year. The higher the coupon, the heavier the early bricks and the shorter the duration. The higher the yield, the harder the distant bricks are discounted, and the shorter the duration.

::: lab ch6-model
model.title: Rate-shock calculator
model.how: Set a bond (coupon, maturity, starting yield), then drag the yield change. The gold line is the true price change; the cyan line is the straight-line approximation using duration alone; the purple dashed parabola adds convexity. The larger the shock, the further the two approximations sit from the gold line.
ctl.c: Coupon
ctl.t: Maturity
ctl.y: Starting yield
ctl.s: Yield change
leg.exact: True price change
leg.dur: Duration approximation (straight line)
leg.dc: Duration + convexity (parabola)
cv.x: Yield change (percentage points) →
cv.y: ↑ Price change (%)
cv.aria: Line chart: the true price change as yield changes, with the straight-line duration approximation and the parabolic approximation that adds convexity
read.p: Price (per 100 dollars face value)
read.mac: Macaulay duration
read.mod: Modified duration
read.conv: Convexity
read.dv01: DV01 (dollars per basis point)
read.exact: True change
read.dur: Duration approximation
read.dc: Duration + convexity
say.small: True change {ex}; duration approximation {du} (off by {e1}); adding convexity gives {dc} (off by {e2}). For a small shock, a modified duration of {m} is enough.
say.big: The shock is large. The true change is {ex}; the duration approximation gives {du}, off by {e1}. With convexity added it is {dc}, off by {e2}. The price–yield curve is curved, so the straight-line approximation always overstates the fall and understates the rise.
:::

For the default bond, 10 years with a 4% coupon and a 4% yield: Macaulay duration {=ch6.mac} years, modified duration {=ch6.mod}, convexity {=ch6.conv}, and a DV01 of {=ch6.dv01} dollars. If yields rise 1 percentage point, the bond really falls {=ch6.ex1}%. The duration approximation gives {=ch6.du1}%, and with convexity added it is {=ch6.dc1}%, almost exact.

Stretch the maturity to 30 years and the shock to +3 percentage points (slightly more than in 2022, when the 10-year Treasury yield rose from 1.52% at the start of the year to 4.25% on 24 October): the true fall is {=ch6.ex3}%, the duration approximation says {=ch6.du3}%, and with convexity it is {=ch6.dc3}%. Cut rates by 3 percentage points in the other direction and the true rise is {=ch6.ex3d}%, while the duration approximation gives only {=ch6.du3d}%. For the same 30-year maturity, the Macaulay duration is {=ch6.mac30} years at a 4% coupon and {=ch6.z30} years at a zero coupon. The 2-year bond's is only {=ch6.mac2} years.

Limits of the model: a bond with no default, annual coupons, and a parallel shift of the whole yield curve. Duration answers the risk when the whole curve shifts in parallel. When the curve steepens or flattens, two portfolios with the same duration can have very different outcomes, which is the next chapter. Duration is not only a property of bonds: stocks, mortgages and government interest bills have durations too. See [[why-one-rate-moves-everything#ch2|Why One Central-Bank Rate Moves the Price of Everything, Chapter 2]], which also contains the Silicon Valley Bank example. {.take}

## Convexity and immunization: same duration, different fates {#ch7}

::: strings
toc: Convexity and immunization
:::

If an asset's duration equals a liability's duration, small parallel moves in rates will not hurt you. This is called immunization. But the same duration can be built in many ways. A “barbell” that holds money at both ends gains slightly when rates move in parallel, and loses when the curve twists. {.law}

First, convexity in three sentences: the price–yield curve is bent; duration is its slope and convexity its curvature; the more convex a bond, the more it gains and the less it loses when rates move a lot (Chapter 6, and [[why-one-rate-moves-everything#ch2|Why One Central-Bank Rate Moves the Price of Everything, Chapter 2]]). What is new here is how to hedge a liability with duration, and why the same duration can meet different fates. An insurer must pay out a sum in seven years. The simplest approach is to buy a 7-year zero-coupon bond, whose maturity matches exactly; this is a **bullet**. Another approach is to put some money in 2-year bonds and some in 15-year bonds, with the proportions set so the portfolio's duration is also seven years; this is a **barbell**. Today the two have the same market value, and when rates shift slightly in parallel, they change by the same amount. The difference is second-order: the barbell's money sits further from year 7, so its convexity is larger.

::: diagram dg-barbell keys=dg.barbell
cap: Figure 5. Two portfolios with the same 7-year duration: the bullet puts everything in year 7, the barbell splits present value between years 2 and 15. Bar heights use the page model's defaults ({=ch7.w} and {=ch7.w2}); the red line is the liability.
aria: Schematic: one bar at year seven above, two bars below at years two and fifteen, with a red dashed line marking the year-seven liability
bullet: Bullet: one 7-year zero
barbell: Barbell: 2-year + 15-year, duration 7
liab: Liability: 100 due in year 7
x: Year
:::

::: lab ch7-model
model.title: Immunize a liability due in seven years
model.how: The liability is 100 dollars due in seven years, and today's zero-coupon rate is a flat 4.5%. Drag the two ends of the barbell, then drag “parallel shift” and “twist”. A positive twist means the long end rises and the short end falls, pivoting on year 7, with the twist growing by one unit for every 10 years away from year 7. The horizontal axis of the chart is the parallel shift; the two lines show the surplus of assets minus liabilities.
ctl.s: Barbell short end
ctl.l: Barbell long end
ctl.p: Parallel shift in rates
ctl.w: Curve twist (positive = steeper)
u.w: {a} / {b}
leg.bullet: Bullet surplus
leg.barbell: Barbell surplus
cv.x: Parallel shift in rates (percentage points) →
cv.y: ↑ Surplus (dollars)
cv.aria: Line chart: the asset-minus-liability surplus of the bullet and barbell portfolios under different parallel rate shifts
read.w: Barbell share, short / long
read.bullet: Bullet surplus (dollars)
read.barbell: Barbell surplus (dollars)
read.disp: Barbell dispersion (years²)
say.par: Parallel shift: the bullet surplus is {u} dollars (it matches the liability exactly), and the barbell surplus is {b} dollars. Whichever way the shift goes, the barbell comes out slightly ahead. That is convexity.
say.none: Rates unchanged: both portfolios are worth exactly the present value of the liability, {L} dollars.
say.twistLose: After the curve twists, the barbell surplus is {b} dollars and the bullet's is {u} dollars. When the long end rises and the short end falls, the barbell's loss on its long leg is far larger than the small benefit convexity gives it.
say.twistWin: After the curve twists, the barbell surplus is {b} dollars and the bullet's is {u} dollars. This twist favours the barbell; twist the other way and it loses.
:::

The default barbell (2-year and 15-year, with present-value shares of {=ch7.w} and {=ch7.w2}) faces a liability with a present value of {=ch7.L} dollars. If rates rise 1 percentage point in parallel, the barbell surplus is {=ch7.up1} dollars; if they fall 1 point, the surplus is {=ch7.dn1} dollars; if they rise 2 points, it is {=ch7.up2} dollars. It gains whichever way the parallel shift goes, and the bigger the shift, the more it gains (roughly in proportion to the square of the shift). But as soon as the curve twists, things change. With no parallel shift and a twist of +1 (long end up, short end down), the barbell surplus becomes {=ch7.tw} dollars; with the reverse twist, it is {=ch7.twn} dollars.

This looks like a free lunch: under a parallel shift, the barbell never loses. If the curve only ever moved in parallel, everyone would buy barbells and the price would be bid up until the benefit disappeared. In reality the market prices convexity. A high-convexity bond has a slightly lower yield (the convexity bias from Chapter 3). And the curve does not only shift in parallel; as the next chapter shows, it also steepens, flattens and bends. The barbell's dispersion of {=ch7.disp} (in years²) measures how sensitive it is to such twists.

Limits of the model: zero coupons, a flat starting curve, and only parallel shifts plus linear twists, with no reinvestment and no trading costs. Real asset-liability management uses “key-rate durations”, which measure the effect of rate changes at each maturity separately. {.take}

## How the curve moves: three shapes {#ch8}

::: strings
toc: Level, slope, curvature
:::

Almost all of the curve's day-to-day movement can be split into three shapes combined: moving up or down together (level), one end up while the other goes down (slope), and the middle bulging or sagging (curvature). Three numbers can describe a whole curve. {.law}

Litterman and Scheinkman (1991) ran a factor analysis of US Treasury returns and found that three factors explain most of the movement; they called them level, steepness and curvature, now usually level, slope and curvature. The principal components are the eigenvectors of the covariance matrix of these changes; see [[eigenvectors|Eigenvalues & Eigenvectors]]. Here we redo it with ACM's one-to-ten-year zero-coupon rates, covering {=ch8.n} monthly changes from January 1990 to October 2026.

::: diagram dg-shapes keys=dg.shapes
cap: Figure 6. The first three principal components of monthly changes in US Treasury zero-coupon rates, 1990–2026 (ACM data, computed on this page). The horizontal axis is maturity; the height of each line is how much that maturity moves within the shape. Together the three shapes explain {=ch8.p123} of the changes.
aria: Line chart: the loadings of the three principal components by maturity. Level is almost a flat line; slope runs from negative at the short end to positive at the long end; curvature bulges in the middle with both ends dipping
l: Level: all move together, {=ch8.p1}
s: Slope: short and long move opposite, {=ch8.p2}
c: Curvature: middle and ends move opposite, {=ch8.p3}
x: Maturity (years)
:::

The first shape (level) alone explains {=ch8.p1} of the changes, the second (slope) {=ch8.p2}, and the third (curvature) {=ch8.p3}. So when people say “rates went up”, most of the time the whole curve moved up together. The duration of Chapter 6 manages exactly this kind of move. The twist that made the barbell lose in the previous chapter belongs to the second kind.

The market has a set of terms for these shapes. **Bull steepening**: short rates fall more than long rates (prices rise, hence “bull”), often seen when a central bank starts cutting. **Bear steepening**: long rates rise more than short rates, often seen when the market starts to demand a higher term premium. **Bull flattening** and **bear flattening** follow the same logic. After the Federal Reserve began cutting rates in September 2024, the curve was both bull-steepening (short rates falling) and bear-steepening (long rates rising) at once. Chapter 12 has the numbers.

Shapes can be written as a function. Nelson and Siegel (1987) describe a whole curve with three parameters, and the zero-coupon curve published by the Federal Reserve (Gürkaynak, Sack and Wright, 2007) uses an extended version of it:

y(τ) = β₀ + β₁·(1 − e<sup>−τ/λ</sup>)/(τ/λ) + β₂·[(1 − e<sup>−τ/λ</sup>)/(τ/λ) − e<sup>−τ/λ</sup>] {#eq .formula}

β₀ is the level at very long maturities, −β₁ is roughly the slope from long to short, and β₂ controls the hump in the middle. λ sets where the hump sits; it is fixed here at 1.37 years (the value used by Diebold and Li, 2006).

::: lab ch8-model
model.title: Three numbers fit a whole curve (Nelson–Siegel)
model.how: Choose a date. The white dots are the par yields the Treasury published that day for maturities from 3 months to 30 years. The gold line is the curve drawn from the three numbers, and the grey dashed lines are the three components. The page opens with the least-squares fit already applied. Drag the three sliders to see how the curve changes, and press “Refit” to return to the optimum.
ctl.b0: β₀ level
ctl.b1: β₁ (negative slope)
ctl.b2: β₂ curvature
btn.fit: Refit
leg.fit: Curve from the three numbers
leg.par: Treasury par yields
leg.parts: Three components
cv.x: Maturity (years) →
cv.y: ↑ Yield (%)
cv.aria: Chart: ten Treasury par-yield points and the Nelson–Siegel three-parameter curve, with its three components
read.rmse: Fit error (root mean square)
read.long: Long-end level β₀
read.slope: Slope −β₁ (long minus short)
read.curv: Curvature β₂
say.good: Three numbers describe the yields at ten maturities to within an average of {e} basis points: the long-end level is {l}, and long minus short is about {s}.
say.bad: The three numbers you have set are off that day's curve by {e} basis points on average. Press “Refit” and least squares will recover the best three numbers.
:::

The root-mean-square fit errors for three dates are {=ch8.rA}, {=ch8.rB} and {=ch8.rC} basis points. The ten quotes are described quite well by three numbers, and the error is largest at the end of June 2023, when the curve was most deeply inverted. On 23 November 2026, β₀ is {=ch8.b0} and β₁ is {=ch8.b1}, so the long end is above the short end. At the end of June 2023, β₁ was {=ch8.b1B}, so the short end was above the long end.

Limits of the model: principal components are a statistical description of changes over the past 36 years, and the shapes and their shares change with the sample. Par yields are not zero-coupon rates; they are fitted here directly, only to show the shapes. {.take}

## Why the curve inverts {#ch9}

::: strings
toc: Why it inverts
:::

The curve inverts because short rates are high and the market expects them to fall later: the expected cuts outweigh the term premium. But sometimes inversion comes mainly from a very low, even negative, term premium. The same inversion can mean different things. {.law}

Go back to the curve builder in Chapter 3. With “cuts ahead”, the curve inverts. The mechanism comes down to one formula: the long end ≈ the average of future short rates + the term premium. Today's short rate is high and expected to fall, so the average is below today's rate. Unless the term premium is large enough, the long end sits below the short end. This is what happens when a central bank has raised rates to a high level, which is why inversions often appear late in a hiking cycle.

But that formula has two terms. If the term premium is very low or negative (Chapter 5: this was the case in the late 2010s), the curve can invert even when the market does not expect large rate cuts. The ACM split lets us divide each month's “10-year minus 1-year” into two parts:

10-year minus 1-year = (difference in the expectations part) + (difference in the term-premium part) {#eq .formula}

::: lab ch9-model
model.title: Split “10-year minus 1-year” into expectations and term premium (2000–2026)
model.how: Drag the month. The gold line is the 10-year minus 1-year zero-coupon yield (ACM); the cyan line is the part from expected short rates; the purple line is the part from the term premium; red shading marks inverted months. Below, a “10-year minus 3-month” measure on the Treasury's basis is shown for the same month.
ctl.m: Month
leg.s: 10-year minus 1-year
leg.exp: Part from expectations
leg.tp: Part from term premium
cv.x: Year →
cv.y: ↑ Percentage points
cv.aria: Line chart: from 2000 to 2026, the 10-year minus 1-year spread and its expectations and term-premium parts; inverted months shaded red
read.s: 10-year minus 1-year
read.exp: From expectations
read.tp: From term premium
read.s3m: 10-year minus 3-month (monthly average)
say.inv.exp: {d}: the curve is inverted ({s}), mainly from expectations ({e}): the market expects short rates to fall. The term-premium part is {tp}.
say.inv.tp: {d}: the curve is inverted ({s}), but mainly from the term premium ({tp}); the expectations part is {e}. This inversion reflects long bonds being in strong demand more than an expectation of rate cuts.
say.up.exp: {d}: the curve slopes upward ({s}), mainly from expectations ({e}); the term-premium part is {tp}.
say.up.tp: {d}: the curve slopes upward ({s}), mainly from the term premium ({tp}); the expectations part is {e}.
:::

The default is June 2023, when 10-year minus 1-year was {=ch9.s23} percentage points: the expectations part {=ch9.e23} and the term-premium part {=ch9.t23}, both pulling it down. The inversions of December 2000 ({=ch9.s00}) and December 2006 ({=ch9.s06}) came almost entirely from expectations ({=ch9.e00}, {=ch9.e06}), with the term-premium part still positive ({=ch9.t00}, {=ch9.t06}). August 2019 was different: inverted by {=ch9.s19}, yet the expectations part was {=ch9.e19}, so the inversion came from the term premium ({=ch9.t19}). By this model, that inversion did not mainly say “the market expects cuts”. By October 2026 the 10-year minus 1-year had come back to {=ch9.s26}, almost all from the term premium ({=ch9.t26}), with an expectations part of {=ch9.e26}.

The dates of the most recent inversion, computed from FRED's daily data (Treasury constant-maturity yields): 10-year minus 3-month turned negative on {=ch9.i3first}, and the inversion ended on {=ch9.i3last}, with a deepest point of {=ch9.i3min} percentage points ({=ch9.i3minD}). After that, from {=ch9.i3bfirst} to {=ch9.i3blast}, it inverted again briefly, with a deepest point of {=ch9.i3bmin}. 10-year minus 2-year was inverted from {=ch9.i2first} to {=ch9.i2last}, with a deepest point of {=ch9.i2min} ({=ch9.i2minD}). On {=ch9.nowD}, the two measures stood at {=ch9.now3} and {=ch9.now2}. (Here negative spells less than 30 trading days apart are merged into one period. *Why One Central-Bank Rate Moves the Price of Everything* uses monthly averages and a different 3-month measure, so its start and end months differ from these by a few months.)

Does inversion predict recessions? (What a recession is and who dates it: [[how-an-economy-is-measured#ch7|How an Economy Is Measured, Chapter 7]].) Each US recession since 1960 has been preceded by an inversion, but some inversions were not followed by a recession. The most recent and longest one (2022–2025) has so far not been followed by one. There are only about eight episodes, and the count of false alarms depends on the method; with a sample this small, “right every time” can easily be luck, and counting hits while ignoring false alarms is [[numbers-lie#c6|base-rate neglect]]. The full record, several ways of measuring it, and the debate are in [[why-one-rate-moves-everything#ch4|Why One Central-Bank Rate Moves the Price of Everything, Chapter 4]], and are not repeated here. This chapter adds one point: how much of an inversion comes from expectations and how much from the term premium affects what it is “saying”. In periods of low term premium, the same depth of inversion contains less expected rate-cutting.

Limits of the model: the split depends entirely on the ACM model. With Kim–Wright the proportions would differ (Chapter 5). The “expectations part” is the short-rate expectation the ACM model derives from historical data (ACM calls it the “risk-neutral yield”: the yield with the prices of risk set to zero), not the real view of surveyed forecasters. {.take}

## Credit spreads: default probability times loss {#ch10}

::: strings
toc: Credit spreads
:::

The extra yield a corporate bond pays over a Treasury of the same maturity is, roughly speaking, “the annual probability of default × the loss if it defaults”. Actual spreads are usually several times that number. The difference is the price investors charge separately for bearing default risk. {.law}

Lend money to a company and in five years it may fail to pay you back. Suppose it has a 2% chance of defaulting each year, and if it defaults you get back 40% of face value (the **recovery rate**), losing 60% (the **loss given default**). The average loss per year is about 2% × 60% = 1.2%. If you only want to break even, you need to earn about 1.2 percentage points more in yield each year. This is the **credit triangle**: spread ≈ probability of default × (1 − recovery rate).

::: diagram dg-credit keys=dg.credit
cap: Figure 7. Two outcomes each year: no default, and the bond carries on; default, and you get back part of the face value at the recovery rate. Discounting and adding up both outcomes for every year gives the corporate bond's price. Schematic.
aria: Schematic: from today the path splits in two, one branch holding on without default, the other defaulting and recovering part of the face value
now: Today
surv: No default: 1 − q
def: Default: q
full: Carry on, get face value
rec: Get face × recovery R
eq: Spread ≈ q × (1 − R)
:::

To do the sum more carefully: the probability of surviving each year and then defaulting in year t is (1−q)<sup>t−1</sup>·q. On default you get R, and if you survive to the end you get 100. Discount and add all of these to get the price, then back out the yield implied by the price and subtract the risk-free rate. That difference is the **spread**. There are two q's here. One is the real-world default frequency p, from rating-agency historical statistics. The other is the “pricing” default frequency q, backed out from market prices. q is usually larger than p, and the ratio is the “risk-premium multiple” in the model below.

::: lab ch10-model
model.title: From default probability to credit spread
model.how: Choose a rating. The model converts S&P's 1981–2024 five-year cumulative default rate into an annual default rate and fills it in. Drag the recovery rate, the risk-premium multiple and the maturity. The gold line is the model spread; the cyan dashed line is the spread that compensates only for expected loss; the red dashed line is the true market spread for that rating on {=ch10.oasD} (ICE BofA index).
ctl.g: Rating
g.BBB: BBB
g.BB: BB
g.B: B
g.CCC: CCC
ctl.p: Annual default probability (real world)
ctl.r: Recovery rate
ctl.k: Risk-premium multiple (pricing ÷ real)
ctl.t: Maturity
leg.s: Model spread
leg.el: Spread compensating only for expected loss
leg.oas: True market spread (this rating)
cv.x: Annual default probability →
cv.y: ↑ Spread (basis points)
cv.aria: Line chart: credit spread against annual default probability, with the spread that compensates only for expected loss and the true market spread for the rating
read.s: Model spread
read.tri: Credit-triangle approximation
read.el: Of which: expected loss
read.prem: Of which: risk premium
read.cum: Cumulative default probability over the term
read.oas: True market spread
say.el: {g}: compensating only for the historical average default loss, the spread would be only {el}. Yet on {d} the market spread for this rating was {o}, and expected loss accounted for only {sh} of it. The rest is what investors demand separately for default risk, illiquidity and tax. Drag the risk-premium multiple up to see how many times over it takes to match.
say.k: With the risk-premium multiple raised, the model spread is {s}, of which expected loss is {el} and risk premium {pr}. The true market spread is {o}.
:::

Per S&P's statistics, BBB-rated companies have a cumulative default rate of {=ch10.c5BBB} over five years, roughly {=ch10.pBBB} a year. With a recovery rate of 40%, the five-year spread that compensates only for expected loss is {=ch10.elBBB} basis points. On 23 November 2026, the option-adjusted spread of the ICE BofA BBB corporate bond index was {=ch10.oBBB} basis points, and expected loss was only {=ch10.shBBB} of it. BB: {=ch10.elBB} against {=ch10.oBB}, i.e. {=ch10.shBB}. B: {=ch10.elB} against {=ch10.oB}, {=ch10.shB}. CCC: {=ch10.elCCC} against {=ch10.oCCC}, {=ch10.shCCC}. Moving down from BBB to B, the lower the rating, the larger the share of the spread that is really default loss; CCC's share is about the same as B's.

This is called the **credit-spread puzzle**. Huang and Huang (2012), using a range of structural models, estimated that for investment-grade bonds default risk explains only a small part of the spread, while for high-yield bonds it explains a much larger share. The rest is attributed to several things. Defaults cluster in the worst economic times (next chapter), when investors most need cash and so demand more compensation. Corporate bonds are harder to sell than Treasuries (liquidity). And US state taxes exempt Treasury interest. The exact proportions depend on the model. The arithmetic here is only a rough comparison, because S&P's historical default rates count issuers worldwide by number of companies, while the ICE index covers US bonds weighted by market value, so the definitions do not match.

Limits of the model: the annual default probability is held constant, the recovery rate is fixed, and the risk-free rate is fixed at 4.5% and flat. The credit triangle is a first-order approximation: at the default settings of 2% default and 40% recovery, the exact spread is {=ch10.exS} basis points, and the triangle approximation gives {=ch10.exTri}. {.take}

## Ratings, junk bonds and clustered defaults {#ch11}

::: strings
toc: Ratings and junk bonds
:::

Ratings rank default risk. BBB and above are called investment grade; BB and below are high yield, colloquially “junk”. The real risk of junk bonds lies not in the average default rate but in defaults clustering: many companies failing in the same year. {.law}

Rating agencies rank issuers with letters. AAA, AA, A and BBB are **investment grade**; BB, B, CCC and below are **speculative grade**, known in the market as **high yield** or **junk**. This line matters: many pension funds and insurers are only permitted by rule to hold investment grade, so when a company is downgraded from BBB to BB, a large group of buyers disappears at once.

::: diagram dg-ladder keys=dg.ladder
cap: Figure 8. Average five-year cumulative default rates for S&P-rated global companies, 1981–2024, by initial rating. The red dashed line separates investment grade from high yield (junk). Data: S&P Global Ratings 2024 Annual Default Study, Table 24.
aria: Horizontal bar chart: five-year cumulative default rates for seven ratings from AAA to CCC, with the three investment-grade tiers above BBB all below 0.5%, then multiplying several times per grade from BBB, to 46.53% for CCC
ig: Above: investment grade
hy: Below: high yield (junk)
x: Five-year cumulative default rate
:::

The ranking works well. The five-year cumulative default rates of AAA, AA and A are all below 0.5% (AAA 0.34%, AA 0.28%, A 0.39%; too few defaults to rank these three). From BBB's 1.36% they multiply three- to fourfold with each grade down, reaching 46.53% for CCC. But the averages hide something else. The annual default rate of speculative-grade issuers in S&P's record averaged {=ch11.rmean} over 1981–2024, with a standard deviation of {=ch11.rsd} percentage points. The peak, in 1991, was {=ch11.rmax}, and in 2009 it reached 9.89%, while in good years it stayed below 1%. Defaults come in waves.

Why? Because companies share one economy. Vasicek's one-factor model (1987, 2002) writes each company's condition as a common factor plus its own luck. In a given year, firm i's asset position is √ρ·Z + √(1−ρ)·εᵢ, and if it falls below a threshold, the firm defaults. Z is the shock common to the whole economy, and ρ is the correlation. The bank capital requirements under the Basel accords are built on this model.

::: lab ch11-model
model.title: 1,000 junk-bond companies, simulated for 2,000 years
model.how: Each “year” draws one economy-wide shock, then a separate luck draw for each company, and counts how many defaulted. The gold bars are the simulated distribution of annual default rates; the cyan outline is the real 44 years of S&P 1981–2024 speculative-grade data. Start with correlation ρ = 0, then drag it to the right.
ctl.p: Average annual default probability
ctl.rho: Correlation ρ
ctl.n: Number of companies
n.100: 100 companies
n.1000: 1,000 companies
btn.go: Simulate again
cv.x: Share of companies defaulting in a year →
cv.y: ↑ Share of years
cv.aria: Bar chart: the simulated distribution of annual default rates alongside the distribution of S&P's actual speculative-grade annual default rates
leg.sim: Simulated years
leg.real: Actual years (S&P 1981–2024)
read.years: Years simulated
read.sd: Simulated: standard deviation of annual default rate
read.q99: Simulated: once-in-a-century year
read.worst: Simulated: worst year
read.realsd: Actual: standard deviation
read.realworst: Actual: worst year
read.loss: Years when default losses exceed the 3.6% spread income
say.run: Simulating…
say.thin: Simulated {n} years. The worst year's default rate was only {w}, with a standard deviation of {sd} points. In the real 44 years the standard deviation was {rsd} points and the worst year {rw}. When companies are uncorrelated, the law of large numbers smooths the fluctuations away, and cannot explain real waves of default. The share of years in which default losses exceed spread income is {l}.
say.fat: Simulated {n} years. The worst year's default rate was {w}, with a standard deviation of {sd} points (actual: {rsd} points, worst {rw}). The common shock makes defaults cluster: the average default rate has not changed, but bad years are much worse. The share of years in which default losses exceed spread income is {l}.
:::

With the default settings, ρ = 0, 1,000 companies and an average default rate of 3.9% (close to S&P's average), over 2,000 years the standard deviation of the annual default rate is only {=ch11.sd0} points. The worst year is {=ch11.max0}, and the share of years in which default losses (at a loss given default of 60%) exceed the 3.6% spread income is just {=ch11.l0}. That is far from the actual {=ch11.rsd} points and the peak of {=ch11.rmax}. Drag ρ to 0.1: the standard deviation becomes {=ch11.sd1} points, the once-in-a-century year is {=ch11.q1} (the closed-form formula for large samples gives {=ch11.vq}), the worst year is {=ch11.max1}, and the share of years where losses exceed the spread is {=ch11.l1}. The average default rate has not changed at all, but the tail has grown several times fatter.

That is the real risk of junk bonds. The extra few points they pay in ordinary times are payment for taking on the rare years when many companies fail together, and those years tend to be the years when stocks also fall and jobs are hard to find. This also accounts for a large part of the credit-spread puzzle in the previous chapter.

Limits of the model: one period per year, all companies identical, constant correlation, and a fixed loss given default. In the real world, defaults in bad years come with lower recoveries (research by Altman and others), which makes bad years worse. Ratings also migrate (an agency's migration table is the transition matrix of a Markov chain; see [[markov-chains|Markov Chains · The Next Step Depends Only on Now]]): downgrades from BBB to BB, the so-called fallen angels, push spreads wider. {.take}

## The frontier: what the curve went through in 2022–2026 {#ch12}

::: strings
toc: The frontier
:::

From 2022 the US Treasury curve went through the deepest and longest inversion since this series begins in 1982, and then came out of inversion in 2024–2025. The Fed first cut rates, then raised them again in September 2026. Over this period short rates fell back while long rates rose markedly. On the estimates of the two main models, most of the long-end rise came from the term premium. The reasons are still debated. {.law}

Each item below is dated and sourced (data checked on 25 November 2026), and carries one of four labels: <span class="tag h">Established</span> the mathematics or data itself, which can be checked; <span class="tag m">Demonstrated</span> computed from public data with a public model, where a different model would change the result; <span class="tag l">Claimed by one party</span> a judgment by a named institution or researcher; <span class="tag l">Common explanation</span> an explanation that markets and researchers often use, whose sources this page has not checked item by item.

### The shape of the curve {#h.shape .sub3}

- <span class="tag h">Established</span> From FRED's daily data, the 10-year minus 3-month spread turned negative on {=ch9.i3first} and ended on {=ch9.i3last}, with a deepest point of {=ch9.i3min} percentage points. The 10-year minus 2-year was inverted from {=ch9.i2first} to {=ch9.i2last}. On {=ch9.nowD}, the two stood at {=ch9.now3} and {=ch9.now2}. In FRED's daily T10Y3M series (from 1982), this is the deepest and longest stretch. The previous long one ran from 17 July 2006 to 29 May 2007, with a deepest point of −0.64. (Chapter 9) {#e1}
- <span class="tag h">Established</span> The policy-rate path (FRED's target-range upper limit, DFEDTARU): raised to 5.50% on 27 July 2023. Cuts began on 18 September 2024, with a half-point cut in one step (5.00% from 19 September). After several further cuts it reached 3.75% on 11 December 2025, and on 17 September 2026 it rose again to 4.00%. For this renewed tightening and the energy shock and rising inflation behind it, see [[why-one-rate-moves-everything#ch12|Why One Central-Bank Rate Moves the Price of Everything, Chapter 12]]. {#e2}
- <span class="tag h">Established</span> From 17 September 2024 to 23 November 2026, the Treasury 3-month yield fell from 4.95% to 4.37%, the 2-year rose from 3.59% to 4.63%, the 10-year rose from {=ch12.g0} to {=ch12.g1}, and the 30-year rose from 3.96% to 5.29%. The short end fell with the cuts (the bull-steepening side), and the long end rose sharply (the bear-steepening side). The 10-year's low was {=ch12.lo}, on 4 August 2020. {#e2b}
- <span class="tag m">Demonstrated</span> On the ACM model, from 17 September 2024 to 23 November 2026, the fitted 10-year yield rose from {=ch12.y0} to {=ch12.y1} ({=ch12.dy} percentage points), of which the expectations part was {=ch12.de} and the term premium {=ch12.dt}. Over the same period the Kim–Wright term premium rose from {=ch12.kw0} to {=ch5.kw} (as of 20 November 2026, {=ch12.dk}). Both models attribute most of the rise to the term premium. (Chapter 5) {#e3}
- <span class="tag h">Established</span> Nominal yield = real yield + breakeven inflation. The real yield on 10-year inflation-protected Treasuries (TIPS, whose principal is indexed to the CPI; how the CPI is built is in [[how-an-economy-is-measured#ch3|How an Economy Is Measured, Chapter 3]]; FRED DFII10) was 1.53% on 17 September 2024 and 2.79% on 23 November 2026, while 10-year breakeven inflation (T10YIE = DGS10 − DFII10) went from 2.12% to 2.13%, barely moving. So almost all of the 1.27-point rise in the nominal 10-year yield over this period was in the real yield. A breakeven is not an inflation forecast: it is expected inflation plus an inflation risk premium, minus a liquidity premium on TIPS, and the three cannot be separated. {#e3b}
- <span class="tag m">Demonstrated</span> On 4 August 2020, ACM's 10-year term premium was {=ch12.loTp} percentage points. Its lowest value in the daily data since 1961 was −1.66, on 9 March 2020. {#e4}

### Why Treasury yields are rising: three common explanations {#h.why .sub3}

First, two facts that can be checked; then three explanations used by markets and researchers. These three are this page's summary; the studies in brackets are representative work on each mechanism, not attributions of the 2024–2026 move, so read them as hypotheses. {#whynote}

- <span class="tag h">Established</span> From 1 December 2025 the Federal Reserve stopped shrinking its balance sheet (quantitative tightening), and afterwards bought short-term Treasury bills to keep reserves ample (Federal Reserve statement of 29 October 2025; see [[why-one-rate-moves-everything#ch10|Why One Central-Bank Rate Moves the Price of Everything, Chapter 10]]). {#e5}
- <span class="tag h">Established</span> The US Treasury's quarterly refunding statement of 4 November 2026: this round sells $125 billion of securities, pays off about $97 billion of maturing debt, and adds a net $28 billion. It expects to keep nominal coupon and floating-rate auction sizes unchanged “over the coming quarters”. {#e6}
- <span class="tag l">Common explanation</span> The supply argument: large government deficits mean more bond issuance, so the duration private investors must absorb keeps growing, and they demand a higher price (term premium) (a representative study of the mechanism: Greenwood and Vayanos, 2014, on bond supply and excess returns). Background figure: in February 2026 the CBO projected federal debt held by the public rising from about 101% of GDP in fiscal 2026 to 120% in 2036 (the figures and sources are in [[why-one-rate-moves-everything#ch11|Why One Central-Bank Rate Moves the Price of Everything, Chapter 11]]). The opposing fact: the Treasury statement above says demand for short-term bills is strong and coupon auction sizes are not being increased for now, so long-end supply has not grown in step with the deficit. {#e7}
- <span class="tag l">Common explanation</span> The inflation-risk argument: inflation has come and gone since 2021, and stocks and Treasuries have often risen and fallen together. Long Treasuries therefore no longer work as “insurance” as they did in the 2010s (Chapter 5), and the term premium has returned to positive values. A representative study of the mechanism: Campbell, Sunderam and Viceira (2017) on the stock–bond correlation and the risk of nominal bonds. The opposing fact: the item above shows breakeven inflation barely changed over the same period; a large rise in the inflation risk premium would usually push it up. {#e8}
- <span class="tag l">Common explanation</span> The neutral-rate argument: perhaps the term premium has not risen at all. Instead, the market may think the “normal” short rate in the future (r*, see [[why-one-rate-moves-everything#ch6|Why One Central-Bank Rate Moves the Price of Everything, Chapter 6]]) is higher than the model assumes. Chapter 3 showed why the two stories cannot be told apart from the curve alone. Both ACM and Kim–Wright assume a long-run level for short rates; change that assumption, and part of “the term premium has risen” becomes “expectations have risen”. {#e9}

### Credit {#h.credit .sub3}

- <span class="tag h">Established</span> The option-adjusted spread of the ICE BofA US High Yield index was {=ch12.hy} on 23 November 2026. Over the three years FRED provides, its lowest was {=ch12.hyMin} ({=ch12.hyMinD}) and its highest {=ch12.hyMax} ({=ch12.hyMaxD}). The investment-grade index was {=ch12.ig}. {#e10}
- <span class="tag h">Established</span> On the same day the CCC spread was {=ch12.ccc}, close to its three-year high ({=ch12.cccMax}, {=ch12.cccMaxD}) and about twice the {=ch12.cccMin} of {=ch12.cccMinD}. High yield as a whole is not wide, but its weakest tier is widening. {#e11}
- <span class="tag h">Established</span> S&P's global speculative-grade default rate was 3.71% in 2023 and {=ch12.sg24} in 2024, higher than the 1.68% and 1.94% of 2021 and 2022 (S&P 2024 Annual Default Study, Table 1). {#e12}
- <span class="tag l">Claimed by one party</span> Structural-model studies such as Huang and Huang (2012) argue that only a small part of the investment-grade spread comes from default risk. The exact share varies with the model and the sample. {#e13}

### Open questions {#h.open .sub3}

- How high is the term premium, really? The two official models now differ by about 0.2 percentage points; historically they have differed by more than two points. {#o1}
- Why has there been no recession (so far) since the 2022–2025 inversion? Has the inversion signal weakened, or is the recession just late? The NBER usually announces that a recession has begun several months to a year after it actually starts. {#o2}
- Once quantitative tightening has ended and deficits stay high, will long rates be set more by supply? {#o3}

The numbers in this chapter are the values for the dates stated, and they will go out of date. {.take}

## Five questions to ask when reading a curve {#ch13}

::: strings
toc: Five questions
:::

A yield curve is a price list, not a crystal ball. When you read one, split each point into three things: expectations, term premium and default risk. {.law}

The next time you see “the curve has inverted”, “10-year yields hit a new high” or “junk-bond spreads have narrowed”, keep asking:

- Which yield is this: par yield, yield to maturity, or zero-coupon rate? The coupon effect can differ by several basis points (Chapter 1). {#q1}
- Of this change, how much is expectations of future short rates and how much is term premium? Which model is used? (Chapters 3 and 5) {#q2 .qs}
- Is the curve shifting in parallel, or steepening or flattening? How long is the duration of what I hold, and is it a bullet or a barbell? (Chapters 6–8) {#q3}
- If it is an inversion: does it mainly come from expected rate cuts, or from a very low term premium? (Chapter 9) {#q4}
- If it is a corporate bond: how much of the spread is the historical average expected loss, and what happens in the worst years? (Chapters 10–11) {#q5}

These questions do not tell you what to buy. They only tell you how the numbers on a curve are produced.

::: footer
**Data and sources.** US Treasury par yields (DGS3MO to DGS30), 10-year minus 3-month (T10Y3M), 10-year minus 2-year (T10Y2Y), the Kim–Wright term premium (THREEFYTP10), and ICE BofA option-adjusted spreads (BAMLH0A0HYM2, BAMLC0A0CM, BAMLC0A4CBBB, BAMLH0A1HYBB, BAMLH0A2HYB, BAMLH0A3HYC) are from the Federal Reserve Economic Data (FRED) database, downloaded 25 November 2026. The ACM zero-coupon yields and term premiums come from the Federal Reserve Bank of New York (Adrian, Crump & Moench, “Pricing the Term Structure with Linear Regressions”, *Journal of Financial Economics*, 2013), downloaded the same day. Default rates are from S&P Global Ratings, *Default, Transition, and Recovery: 2024 Annual Global Corporate Default And Rating Transition Study* (27 March 2025), Tables 1 and 24. The Treasury refunding statement (4 November 2026) is from home.treasury.gov. The URL and verification scope for each item are in BRIEF.md, alongside this page.

**Models.** Zero-coupon pricing, forward rates and holding-period returns are standard no-arbitrage arithmetic. The split into expectations and term premium follows Campbell and Shiller (1991). Duration and convexity are textbook formulas dating back to Macaulay (1938). The factor shapes first appear in Litterman and Scheinkman (1991, a factor analysis of Treasury returns), and the Nelson–Siegel form in Nelson and Siegel (1987) and Diebold and Li (2006). The credit-spread puzzle is from Huang and Huang (2012), and default correlation uses Vasicek's one-factor model. Every model is scaled down. Where a parameter exists only to make the mechanism visible, the end of the relevant chapter says so.

**About this page.** This essay was written by AI. It explains mechanisms only. It is not investment advice, and it does not forecast rates or defaults.
:::
