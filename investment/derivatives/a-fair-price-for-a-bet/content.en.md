---
lang: en
title: How Can a Bet on the Future Have a Fair Price? · A Hands-on Essay
desc: Nobody knows next year's share price, yet options on it trade thousands of times a day at nearly the same price. This essay starts from "a forward price is not a forecast" and climbs through the binomial tree, geometric Brownian motion, the Black–Scholes formula and its partial differential equation, the Greeks and hedging, then shows where it fails: the volatility smile, fat tails, margin and clearing, and the state of the market in November 2026. Thirteen hands-on models. Mathematics and market structure only; not investment advice.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.pt: {v} percentage points
u.yr: {v} years
u.mo: {v} months
u.day: {v} days
u.x: {v} times
u.money: {v} yuan
u.steps: {v} steps
u.times: {v} times
u.shares: {v} shares
u.yr.one: 1 year
u.mo.one: 1 month
u.day.one: 1 day
u.steps.one: 1 step
u.times.one: once
u.shares.one: 1 share
u.none: none
u.every: about once every {v} years
u.everyDays: about once every {v} trading days
u.never: longer than the age of the universe
opt.put: put option
opt.call: call option
:::

# How Can a Bet on the Future Have a Fair Price? {#hero}

::: strings
kicker: Investment · Derivatives · A hands-on essay
:::

Nobody knows the share price a year from now.<br>Yet options on it change hands thousands of times a day at nearly the same price. {.sub}

You and a friend bet on whether a certain stock will rise above 100 yuan next year. You think the odds are 80%, and he thinks only 30%. The two of you see the future so differently that the bet seems to be worth whatever each of you says. But in the options market, a contract like this is quoted at almost the same price by the buyer who expects a rise and the seller who expects a fall; the difference is only a few cents. This essay asks just one question: **how can a bet whose outcome nobody knows have a price everyone accepts?** The answer has three parts. Chapters 1–4 explain where this price comes from: it is not predicted, but assembled from other things. Chapters 5–7 push the assembly into continuous time, arrive at the Black–Scholes formula, and show how a seller hedges with it every day. Chapters 8–11 cover where this approach fails, how the market has responded, and the state of things in November 2026. {.lead}

Prerequisites: [[compound-interest]] (discounting), [[expected-value]] (expectation), and [[central-limit-theorem]] (many small random numbers add up to a bell curve). Each model in the essay is a real textbook or original-paper model, only on a small scale; the last paragraph of each chapter says what it leaves out. **This essay explains only mathematics and market structure. It is not investment advice, and it contains no strategy that makes money.** The essay was written by AI. {.note}

## Forward Price Is Not a Forecast {#ch1}

::: strings
toc: Forward price is not a forecast
:::

The price of a contract to buy or sell in a year's time, at a price fixed today, does not depend on anyone's view of what will happen in that year. Its price equals today's price plus the net cost of holding the item for a year; otherwise someone could make money without taking any risk. {.law}

A bakery fears that flour will rise in price next year, and a farm fears that wheat will fall in price next year. Today they sign a contract: in a year, the farm delivers wheat at 2,600 yuan a ton, the bakery pays that price, and the market price at that time does not matter. Such a contract is called a **forward**; the standardised version traded on an exchange, with gains and losses settled every day, is a **futures** contract. It is the simplest derivative: it has no value of its own, and its value is derived from the price of something else (wheat).

The question is how 2,600 is set. The intuition is that you guess what wheat will cost next year and set the price at that guess. This intuition is wrong. Take a cleaner example: a stock that pays no dividend, priced at 100 yuan today, with an annual interest rate of 4%. You want to own the stock in a year, and you have two ways to do it. First, sign a forward and pay F yuan in a year to receive the stock. Second, borrow 100 yuan today, buy the stock and hold it, and repay the loan with interest in a year. Both routes end with the same thing: one share in hand. So their costs must be equal: F equals 100 yuan plus a year's interest, which is {=ch1.F} yuan.

::: diagram dg-carry keys=dg.carry
cap: Figure 1 A riskless arbitrage when the forward quote of 110 yuan is above {=ch1.F} yuan (the "cost-of-carry arbitrage"). No money is spent today; a year later the net gain is the difference between the two. The amounts are computed by the page's model.
aria: Diagram: borrow money to buy the stock today and sell a forward; in a year hand over the stock, receive the forward payment and repay the loan; the net gain is the difference
now: Today
later: In one year
a1: Borrow 100 yuan
b1: Repay {=ch1.F} yuan
a2: Buy one share
b2: Hand over this share under the contract
a3: Forward: sell at 110 yuan in a year
b3: Receive 110 yuan
na: Net outlay: 0 yuan
nb: Net gain: {=ch1.gap} yuan
:::

What if someone is so sure the stock will soar that they quote a forward price of 110 yuan? Then do what Figure 1 shows: borrow 100 yuan, buy the stock, and sign a contract to sell it to them for 110 yuan in a year. A year later, whether the stock is at 50 or at 200, you hand over the stock, receive 110 yuan, repay {=ch1.F} yuan, and keep a net {=ch1.gap} yuan. No capital was put in and no risk was taken. Profit that needs no capital and carries no risk is called **arbitrage**. As soon as people do this, the forward price is pushed back down. If the quote is too low, do the reverse: short-sell the stock, deposit the cash, and sign to buy it back. The profit is just as certain.

If the stock pays a dividend, or the item has storage costs, the net cost changes. The formula is F = S·e<sup>(r−q)T</sup>: S is today's price, r is the interest rate, q is the yield the item itself provides while held (dividends; storage costs count as a negative yield), T is the number of years, and e is the base of continuous compounding (see [[exponents-logarithms]]). The quantity r − q is called the **cost of carry**.

::: lab ch1-model
model.title: Quote a forward and see whether free money is on offer
model.how: The spot price is fixed at 100 yuan. Drag the interest rate, the yield from holding and the term, then drag the forward quote. The cyan line is the forward price given by the formula; the gold dot is your quote. As long as the gold dot is off the cyan line, the panel below shows a riskless strategy and how much it earns.
ctl.r: Interest rate
ctl.q: Yield from holding (dividends)
ctl.t: Term
ctl.f: Forward quote
read.fair: Forward price from the formula
read.quote: Your quote
read.gap: Quote − formula price
read.profit: Riskless profit per share (at expiry)
cv.x: Term (years) →
cv.y: ↑ Forward price (yuan)
cv.fair: Forward price from the formula
cv.spot: Spot price 100 yuan
cv.aria: Line chart: the forward price from the formula against term, with the position of your quote
say.carry: The quote is {gap} yuan above the formula price. Today borrow {loan} yuan to buy {units} shares and sign a contract to sell them; dividends received in the meantime buy more shares. At expiry, hand over 1 share and receive {fq} yuan, repay {repay} yuan of the loan, <em>net gain {gap} yuan</em>, whatever the share price is at expiry.
say.reverse: The quote is {gap} yuan below the formula price. Today short-sell {units} shares, receive {loan} yuan and deposit it; sign a contract to buy the shares back. At expiry the deposit has become {repay} yuan; pay {fq} yuan to buy back 1 share and close the position, <em>net gain {gap} yuan</em>, whatever the share price is at expiry.
say.none: The quote and the formula price differ by less than 0.01 yuan, so there is no free money. Note that no one's view of whether prices will rise or fall appears in this price.
:::

Raise the yield from holding above the interest rate, and the formula price falls below the spot price. This does not mean the market is bearish. It means that holding the item earns a yield, so whoever receives it a year later has missed that yield and pays less. Real numbers behave the same way: at the close on 17 November 2026 the S&P 500 index stood at {=ch1.spot} points; the forward read from option prices was {=ch1.fDec} points for 18 December 2026 and {=ch1.fMar} points for 19 March 2027 (how these are read is explained in Chapter 8). The forward sits above spot because the interest rate is higher than the dividend yield, not because the market expects a rise.

This model assumes that borrowing and lending happen at the same rate, that the stock can be sold short freely, that there are no fees, and that nobody defaults. In practice all of these have costs, so the forward price is not a single line but a narrow band: inside the band there is no arbitrage, and outside it there is. For things that cannot be stored (electricity) or are hard to sell short, the band can be wide. {.take}

## Options: Only the Good Half {#ch2}

::: strings
toc: Options: only the good half
:::

An option is a right: at expiry you may buy (or sell) at an agreed price, or you may not. Its payoff at expiry is a broken line. Such lines can be added together, and among a call, a put, the stock and a deposit, any three can be combined to make the fourth. {.law}

When you book a room, you pay a 200-yuan deposit for the right to stay next month at 800 yuan a night. If comparable rooms have risen to 1,200 yuan by then, you stay at 800 and come out ahead. If they have fallen to 500 yuan, you give up the deposit and book a 500-yuan room. The deposit buys the right to stay at 800, not an obligation to do so.

**A call option** gives its holder the right to buy at a set price K, the **strike price**, on the expiry date. If the stock price S is above K at expiry, exercise the option and gain S − K; if it is below K, do not exercise, and the payoff is 0. In one formula: max(S − K, 0). **A put option** is the reverse: the right to sell at K, with payoff max(K − S, 0). Buying an option requires paying an upfront sum, the **premium**, and the question this essay answers is what that premium should be. The seller takes the premium and bears the opposite payoff: whatever the buyer gains, the seller loses.

::: diagram dg-payoff keys=dg.payoff
cap: Figure 2 Expiry payoffs of the four basic positions, before the premium. The horizontal axis is the stock price at expiry; the kink is at the strike K. The buyer's loss is capped; the seller's loss is unlimited (sold call) or large (sold put). Schematic, not to scale.
aria: Diagram: expiry payoff lines for buying a call, buying a put, selling a call and selling a put
t1: Buy call
t2: Buy put
t3: Sell call
t4: Sell put
ax: Across: price at expiry   Up: payoff
:::

These lines can be added. "Hold one share and buy a put": when the price falls below K, the put makes up the difference, so at expiry the position is worth at least K, and it still captures any rise. "Buy a call and put aside an amount that will be exactly K yuan at expiry": if the price is below K, the call is not exercised and you hold K yuan; if it is above K, you use the K yuan to exercise and receive the share. At expiry the two positions are worth the same at every stock price: max(S, K).

Two things that are identical at expiry must cost the same today, or someone could buy the cheaper one and sell the dearer one, which is arbitrage again. So: call plus the present value of K equals put plus stock, that is, C − P = S − K·e<sup>−rT</sup>. This is called **put–call parity**. It needs no model, only the assumption that there is no free money. It also shows that calls and puts are not two independent bets: once you know the price of one, the other is fixed.

::: lab ch2-model
model.title: Stitching the lines together
model.how: Pick a combination and drag the strike. The thin lines are the expiry payoff of each leg; the thick gold line is their sum. Look at "stock + put" and "call + deposit" in turn: the two thick lines are identical, and so are the "cost today" figures below.
ctl.st: Combination
ctl.k: Strike K
st.call: Buy a call
st.put: Buy a put
st.protect: Stock + put
st.fiduciary: Call + deposit
st.covered: Stock − call
st.straddle: Call + put
st.synth: Call − put
read.cost: Cost today
read.min: Minimum at expiry
read.max: Maximum at expiry
read.c: Call C
read.p: Put P
read.cp: C − P
read.rhs: Present value of S − K
max.inf: No upper limit
cv.x: Stock price at expiry (yuan) →
cv.y: ↑ Value at expiry (yuan)
cv.sum: Total
cv.leg.call: Call
cv.leg.put: Put
cv.leg.stock: Stock
cv.leg.bond: Deposit
cv.aria: Line chart: the expiry payoff of each leg of the chosen combination, and their sum
say.call: Buy a call: the most you can lose is the premium, {cost} yuan; for every yuan the stock is above {k} yuan, you gain one more yuan.
say.put: Buy a put: the most you can lose is the premium, {cost} yuan; for every yuan the stock is below {k} yuan, you gain one more yuan, up to a maximum of {k} yuan.
say.protect: Stock plus put: at expiry it is worth at least {k} yuan, and it costs {cost} yuan today. It matches "call + deposit" at every stock price, so the cost is the same: this is parity.
say.fiduciary: Call plus a deposit that becomes {k} yuan at expiry: at expiry it is worth at least {k} yuan, and it costs {cost} yuan today. It matches "stock + put" at every stock price, so the cost is the same: this is parity.
say.covered: Stock with a sold call: you collected the premium up front, so today you pay only {cost} yuan, but at expiry the position is worth at most {k} yuan; any gain above that goes to the buyer of the call.
say.straddle: Buy a call and a put: you pay {cost} yuan, and the farther the stock moves from {k} yuan, the more you get, whichever way it goes. The bet is not on direction but on how large the move is (Chapter 7).
say.synth: Buy a call, sell a put: at expiry this is the same as buying one share at {k} yuan, which is exactly a forward. Today's cost of {cost} yuan is exactly the present value of S − K.
:::

Using the formula from Chapter 6 (stock 100 yuan, strike 100 yuan, one year to expiry, interest rate 4%, volatility 20%), the call is worth {=ch2.C} yuan and the put {=ch2.P} yuan, a difference of {=ch2.cp} yuan, which is exactly 100 yuan minus the present value of 100 yuan. Drag the strike to around {=ch2.kf} yuan and C and P become equal: that strike is the forward price from Chapter 1.

Parity holds exactly for **European options**, which can be exercised only at expiry. **American options**, which can be exercised early, satisfy only a set of inequalities (Chapter 4). The "cost today" here uses the formula from Chapter 6, but parity itself does not depend on that formula: if the formula were wrong, C and P would both be wrong, and their difference would still hold. {.take}

## One Step: Assembling the Option {#ch3}

::: strings
toc: One step: assembling the option
:::

If the stock price has only two possible values at the next step, then "some shares plus a loan" can be worth exactly as much as the option in both cases. The option's price today can then only equal the cost of that combination, and that cost contains no "probability of a rise." {.law}

Back to the opening bet. A share costs 100 yuan today; in a year it will be either 120 yuan or 80 yuan, with no other possibility. A call with a strike of 100 yuan is worth 20 yuan if the stock rises and 0 if it falls. You think the chance of a rise is 80%; your friend thinks 30%. What is the option worth today?

Set the probabilities aside and try to build something identical to the option out of shares and borrowing. Buy Δ shares and borrow B yuan. To match the option in both cases takes two equations: if the stock rises, Δ × 120 minus the repayment equals 20; if it falls, Δ × 80 minus the repayment equals 0. Subtracting the two gives Δ × 40 = 20, so Δ = {=ch3.delta}. The falling-case equation says the repayment is 40 yuan, so the amount borrowed today is the present value of 40 yuan: {=ch3.B} yuan.

::: diagram dg-onestep keys=dg.onestep
cap: Figure 3 A one-step tree. Half a share plus a loan matches the option exactly in both the up and the down state, so the option's price today is the cost today of that combination. The numbers are computed by the page's model (interest rate 4%).
aria: Diagram: the stock goes from 100 to 120 or to 80; the option is worth 20 or 0; half a share minus a 40-yuan repayment equals the option in both cases
s0: Today: stock 100
up: Up: stock 120
dn: Down: stock 80
fu: Option worth 20
fd: Option worth 0
ru: 0.5 share × 120 − repayment 40 = 20
rd: 0.5 share × 80 − repayment 40 = 0
rep: Portfolio: buy {=ch3.delta} shares, borrow {=ch3.B} yuan
pr: Option value today {=ch3.cost} − {=ch3.B} = {=ch3.price} yuan
:::

This portfolio costs {=ch3.delta}×100 − {=ch3.B} = **{=ch3.price} yuan** today. The option matches it in every outcome a year from now, so the option too can only be worth {=ch3.price} yuan today. If it were sold for more, traders would sell the option and buy the portfolio; if for less, the reverse. This method is called **replication**, and Δ is called the **hedge ratio**.

Note that no probability appears in the derivation. Your 80% and your friend's 30% are not used. Under the old method of taking the expected payoff and discounting it, 80% gives {=ch3.naive80} yuan and 30% gives {=ch3.naive30} yuan, and neither of you can persuade the other. The replication price of {=ch3.price} yuan must be accepted by both, because any departure from it lets someone make free money. Your disagreement about probabilities has not disappeared; it shows up elsewhere. Someone who thinks there is an 80% chance of a rise may judge the option to be good value and buy it, but the price they pay is still {=ch3.price} yuan.

::: lab ch3-model
model.title: Change the chance of a rise and see which price moves
model.how: Drag the "real probability of a rise". The slanted line is the price from the "discounted expected payoff" method, which moves with the probability; the horizontal line is the price from replication, which does not move at all. Then drag the rise, the fall and the strike to see how the replication recipe changes.
ctl.p: Real probability of a rise
ctl.u: Rises to
ctl.d: Falls to
ctl.k: Strike K
read.delta: Shares bought Δ
read.b: Borrowed
read.price: Replication cost (option price)
read.naive: Discounted expected payoff
read.q: Risk-neutral probability q
read.ret: Expected return on the stock
cv.x: Real probability of a rise →
cv.y: ↑ Price (yuan)
cv.rep: Replication cost
cv.naive: Discounted expected payoff
cv.aria: Line chart: the discounted expected price changes linearly with the probability of a rise; the replication cost is a horizontal line; the two cross at the risk-neutral probability
say.hi: At a probability of {p}, the discounted expectation is {naive} yuan, {gap} yuan above the replication cost of {price} yuan. Whoever buys at {naive} yuan lets the seller spend {price} yuan building the same payoff and hand it over, a sure profit of {gap} yuan.
say.lo: At a probability of {p}, the discounted expectation is {naive} yuan, {gap} yuan below the replication cost of {price} yuan. Whoever sells at {naive} yuan lets the buyer build the replicating portfolio the other way round, a sure profit of {gap} yuan.
say.eq: At a probability of {p}, the discounted expectation is exactly the replication cost of {price} yuan. This probability is q: under it, the expected return on the stock equals the interest rate.
say.zero: The strike of {k} yuan is no lower than the stock price after a rise, so the option is worthless in both outcomes; its price is 0.
:::

Drag the probability to where the two lines cross: that probability is {=ch3.q}. It is called the **risk-neutral probability**, written q. It is not a probability anyone believes; it is a bookkeeping number. Under q, the expected return on the stock equals the 4% interest rate exactly, so the "discounted expected payoff" method gives exactly the replication cost. Hence in pricing one may pretend that everyone is indifferent to risk and that every asset grows at the interest rate, then take the expectation under q and discount it. This is simply another way of computing replication, convenient for calculation. It is not a description of the world.

Where did the real probability go? It is hidden in the share price. If everyone thought there was an 80% chance of a rise, today's share price would not be 100 yuan. The option is priced off the share price, and the share price has already absorbed everyone's views and their dislike of risk.

A one-step world with two outcomes is a fiction; a real share price can take countless values. But if the year is cut into many small steps, each with only an up or a down move, the method can be carried through the whole path. That is the next chapter. {.take}

## Many Steps: A Tree {#ch4}

::: strings
toc: Many steps: a tree
:::

Cut time into N steps, each moving up or down a little, and you get a tree. Starting from the payoff at expiry and working backward one step at a time with the one-step replication, you arrive at today's price. As the number of steps grows, the price settles on a single number. {.law}

A chess player reasons backward from an endgame: the last move is clear, the move before it is chosen for its best result, and so on back to the current position. Pricing on a tree follows the same procedure, called **backward induction**.

Cut the year into N steps, each of length Δt. At each step the stock is multiplied by u or by d, with u = e<sup>σ√Δt</sup> and d = 1/u. σ is the stock's **volatility**, which the next chapter discusses in detail; for now, read it as how much the price swings up and down in a year. An up move followed by a down move ends at the same price as a down move followed by an up move, so the branches recombine: after N steps there are N + 1 nodes, not 2<sup>N</sup>. This tree was proposed by Cox, Ross and Rubinstein in 1979, and is called the **CRR tree**.

::: diagram dg-tree keys=dg.tree
cap: Figure 4 The three-step CRR tree (stock 100 yuan, strike 100 yuan, one year, interest rate 4%, volatility 20%). Above each node is the stock price; below it is the value of the call. The last column is the payoff at expiry; every other value is obtained from the two values to its right by weighting them with the risk-neutral probabilities and discounting one step. Numbers computed by the page's model.
aria: Diagram: a three-step binomial tree with ten nodes, each showing the stock price and the value of the call, computed from right to left layer by layer
st: Stock price
op: Option value
t0: Today
t3: Expiry
back: ← Computed from right to left, layer by layer
:::

At every node the work is the same as in Chapter 3: look at the two values beyond it and work out the cost of the replicating portfolio. In risk-neutral terms it is one line: value at this node = e<sup>−rΔt</sup> × [q × value above + (1 − q) × value below], where q = (e<sup>rΔt</sup> − d)/(u − d). The three-step tree in Figure 4 gives {=ch4.n3} yuan; 50 steps give {=ch4.n50} yuan, and 500 steps give {=ch4.n500} yuan.

The tree can also answer questions the formula cannot. An **American option** can be exercised on any day before expiry. On a tree, add one rule: at every node, compare the value of holding on with the payoff from exercising now, and take the larger. With the same parameters, the European put is worth {=ch4.euPut} yuan and the American put {=ch4.amPut} yuan. The extra {=ch4.early} yuan is the value of the right to exercise early: when the stock has fallen deeply, it pays to take the 100 yuan now and put it in the bank to earn interest, rather than wait. An American call on a stock that pays no dividend is worth exactly as much as a European call; exercising early never pays.

::: lab ch4-model
model.title: Add more steps
model.how: Drag the number of steps N. The zigzag line is the tree price for every N from 1 to 150; the gold dot is the N you chose; the cyan horizontal line is the value given by the formula in the next chapter. Watch the zigzag close in on the horizontal line. Then switch to a put and tick "can be exercised early".
ctl.n: Number of steps N
ctl.type: Option
ctl.am: Can be exercised early (American)
ctl.k: Strike K
type.call: Call
type.put: Put
read.tree: Price on the tree
read.bs: Formula price (European)
read.diff: Tree − formula
read.early: Early-exercise value
cv.x: Number of steps N →
cv.y: ↑ Price (yuan)
cv.bs: Formula (European)
cv.aria: Line chart: the binomial tree price converges in a zigzag to the formula price as the number of steps increases
say.eu: A {n}-step tree gives {tree} yuan; the formula gives {bs} yuan; the difference is {diff} yuan. Doubling the steps roughly halves the gap.
say.amPut: The American put on a {n}-step tree is worth {tree} yuan, {early} yuan more than the European put on the same tree. There is no ready formula for this part; it has to be computed on a tree (or with another numerical method).
say.amCall: The American call on a non-dividend stock on a {n}-step tree is worth {tree} yuan, exactly the same as the European call: the right to exercise early is worth nothing.
:::

The line zigzags: depending on whether N is odd or even, the strike falls at a different position relative to the nodes, so the error changes sign. But the envelope narrows at a rate of 1/N. The number it converges to as N goes to infinity is the Black–Scholes formula; to see why, we first need to see what the distribution of the stock price becomes when N is large.

The tree assumes that σ and the interest rate are constant over the whole period, and that the position can be adjusted between steps at no cost. Real trading desks use more steps, or trinomial trees and finite differences (Chapter 6), to price American options. {.take}

## How Stock Prices Move: Geometric Brownian Motion {#ch5}

::: strings
toc: How stock prices move: geometric Brownian motion
:::

Treat each step's up or down move as a small, independent percentage change. After many steps are compounded, the logarithm of the price is approximately normally distributed, and its spread grows with the square root of time, not with time itself. {.law}

A drunk takes one random step left or right every second. After 100 steps he is about 10 steps from the start; after 10,000 steps, about 100 steps away, not 1,000. Because left and right steps cancel out, the distance grows with the square root of the number of steps. This is called a random walk.

On the tree, the stock price is multiplied by u or d at each step. Take logarithms, and each step adds or subtracts σ√Δt, which is exactly a random walk. After N steps, the log price is the sum of N independent small random numbers. [[binomial-normal]] and [[central-limit-theorem]] showed that such sums tend toward a normal distribution. So when N is large, ln(S<sub>T</sub>/S<sub>0</sub>) is normally distributed with standard deviation σ√T. This limit is called **geometric Brownian motion**. "Brownian motion" is the continuous limit of the random walk; "geometric" means that it acts on percentage changes (logarithms), so the price never becomes negative.

σ is the **volatility**: the standard deviation of the log return over one year. σ = 20% means that after a year the log return has about a two-thirds chance of lying within 0.2 either side of the median; in price terms, between about 0.82 and 1.22 times the median. For another horizon, multiply by the square root of time: one trading day (1/252 of a year) gives {=ch5.day}, one month gives {=ch5.month}, and four years gives {=ch5.y4}, not 80%.

::: lab ch5-model
model.title: Thirty possible paths
model.how: Drag volatility, average growth rate and term. The top chart shows 30 random paths; the cyan band is one standard deviation either side of the median, and its width grows with √T. The bottom chart shows the log returns of the 4,000 path endpoints, overlaid on a normal curve. Press "New set" to see how much randomness there is.
ctl.mu: Average growth rate μ
ctl.sig: Volatility σ
ctl.t: Term T
ctl.new: New set of paths
read.band: One-standard-deviation range
read.median: Median
read.mean: Mean
read.below: Probability the endpoint is below the start
cv.x: Time (years) →
cv.y: ↑ Stock price (yuan)
cv.hx: Log return at endpoint →
cv.hy: ↑ Number of paths
cv.normal: Normal curve
cv.aria: Line chart: 30 simulated stock price paths and a one-standard-deviation band
cv.haria: Histogram: log returns of the 4,000 path endpoints, with a normal curve
say.up: After {t}, the stock has about a two-thirds chance of being between {lo} and {hi} yuan. Median {median} yuan, mean {mean} yuan: the mean is higher, because a few paths that rise a great deal pull it up.
say.drag: After {t}, the mean is {mean} yuan, above the start, but the median is only {median} yuan, below the start: {below} of the paths lose money. Volatility itself drags the typical outcome down by σ²/2.
say.down: After {t}, the mean of {mean} yuan and the median of {median} yuan are both no higher than the start, and {below} of the paths lose money.
:::

The model has two parameters. μ is the average growth rate and σ the volatility. Drag μ from 0 to 20% and the band tilts upward as a whole, but its width does not change. Recall Chapter 3: the option price contains no probability of a rise. The continuous counterpart is this: **the option price contains no μ**. Which way the band tilts does not affect the option's price; only its width, σ, does. This is the most counterintuitive point of the whole essay, and the formula in the next chapter shows it directly.

There is one more detail: the median of the paths grows at μ − σ²/2, not μ. Push σ up to 60% with μ kept at 6%, and the mean still rises, yet more than half of the paths lose money.

Geometric Brownian motion assumes constant volatility, day-to-day moves that are uncorrelated with one another, and no jumps. None of these three holds exactly in real markets; Chapter 8 uses real data to show how far off they are. Generating paths from random numbers and averaging over them is the Monte Carlo method; see [[monte-carlo]]. {.take}

## Black–Scholes: The Formula and Its Equation {#ch6}

::: strings
toc: Black–Scholes: the formula and its equation
:::

Under geometric Brownian motion, letting the number of tree steps go to infinity makes the replication cost converge to a closed-form formula. The same result is also the solution of a partial differential equation of the same kind as the equation for heat spreading through a metal rod. {.law}

In 1973 Black and Scholes published this formula; Merton gave a more general derivation the same year. For a European call on a non-dividend stock:

C = S·N(d₁) − K·e<sup>−rT</sup>·N(d₂), d₁ = [ln(S/K) + (r + σ²/2)T] / (σ√T), d₂ = d₁ − σ√T. {#formula .formula}

N(·) is the cumulative probability of the standard normal distribution. The formula looks intimidating, but its structure is the "Δ shares minus a loan" of Chapter 3. The first term, S·N(d₁), is the market value of the shares in the replicating portfolio, and N(d₁) is Δ at this moment. The second term is the loan, where N(d₂) is the risk-neutral probability that the stock ends above K at expiry. With the familiar example (S = K = 100, r = 4%, σ = 20%, T = 1): N(d₁) = {=ch6.Nd1}, so hold {=ch6.shares} yuan of stock and borrow {=ch6.loan} yuan. The difference, using unrounded figures, is **{=ch6.C} yuan**, the number the tree converged to in the last chapter.

The formula has five quantities: S, K, T, r and σ. The first four are written into the contract or come from market quotes; only σ has to be estimated. μ does not appear. Two people can hold completely opposite views on whether the stock will rise or fall; as long as they agree on σ, they must agree on the same option price.

How is the formula derived? Each node of the tree satisfies the rule "the value here is the discounted, weighted average of the two values beyond it." Shrink the step length to zero, and this rule becomes an equation for the option value V(S, t):

∂V/∂t + ½σ²S²·∂²V/∂S² + rS·∂V/∂S − rV = 0. {#pdeq .formula}

This is the **Black–Scholes equation**. Each term has a meaning. ∂V/∂t is the change due to the passage of time; ∂V/∂S is Δ, and [[derivative]] explained that a derivative is the rate of change at this moment; ∂²V/∂S² is how fast Δ changes with the stock price, which the next chapter calls Γ; −rV is discounting. The equation says that once the directional exposure to the stock is hedged away, what remains is a riskless portfolio, which can only grow at the interest rate. Change variables and it becomes the heat equation ∂u/∂τ = ∂²u/∂x²: the payoff line at expiry is the initial "temperature distribution", and the farther from expiry, the more the corner is spread out into a rounded curve.

::: diagram dg-stencil keys=dg.stencil
cap: Figure 5 Solving the equation by finite differences. Stock price and time are cut into a grid. The bottom row is expiry, where each point's value is the payoff; each row above is one step further from expiry, and each point is computed from three neighbouring points in the row below. Schematic; grid sizes not to scale.
aria: Diagram: a grid of stock price against time; the bottom row is the payoff at expiry; each point in the row above is a weighted combination of three adjacent points in the row below
ax: Stock price →
ay: Further from expiry ↑
row0: Expiry: each point = payoff
st: New point = weighted sum of the three below
edge: Edge values known
:::

A computer solves this equation much as it solves the tree (Figure 5): it works backward from expiry across the grid. The most direct method is called the **explicit scheme**, in which each new point is a weighted sum of three old points. It has one flaw: if the time step is too large, some weights become negative, errors are amplified at every step, and the result blows up. The **Crank–Nicolson scheme** solves a system of linear equations at each step and does not blow up at any step size (with very large steps it leaves small wiggles near the corner, but they are not amplified).

::: lab ch6-model
model.title: Watch the corner spread out
model.how: Drag "time left to expiry" from 0 to 1 year. The gold line is the option value computed step by step by finite differences, the cyan line is the formula, and the grey line is the payoff at expiry. Then switch to the explicit scheme and drag the number of time steps down to see where it starts to blow up.
ctl.sc: Scheme
ctl.m: Stock price grid
ctl.nt: Number of time steps
ctl.tau: Time left to expiry
ctl.sig: Volatility σ
sc.cn: Crank–Nicolson
sc.ex: Explicit
m.c: 60 nodes
m.f: 240 nodes
read.pde: Finite differences (S = 100)
read.bs: Formula (S = 100)
read.diff: Difference
read.need: The explicit scheme needs at least
cv.x: Stock price (yuan) →
cv.y: ↑ Option value (yuan)
cv.pay: Payoff at expiry
cv.bs: Formula
cv.pde: Finite differences
cv.aria: Line chart: the finite-difference solution, the formula solution and the payoff at expiry, against the stock price
say.ok: {tau} to expiry: finite differences give {pde} yuan, the formula {bs} yuan, a difference of {diff} yuan. A finer grid with more steps narrows the gap.
say.exok: Explicit scheme, {nt} steps: stable, gives {pde} yuan; the formula gives {bs} yuan. This grid needs at least {need} steps, and you have enough.
say.bad: Explicit scheme, {nt} steps: <em>unstable</em>. This grid and volatility need at least {need} steps. With too few, the error is amplified at each step, and the further from expiry, the less meaningful the number. With Crank–Nicolson, the same number of steps is stable.
say.zero: With zero time left, the option is worth its payoff, a single broken line. Drag right to watch the corner round off.
:::

On a 60-node grid, the explicit scheme at σ = 20% needs at least {=ch6.need60} steps. Refine the grid to 240 nodes and it needs {=ch6.need240} steps: four times the resolution, sixteen times the steps. Crank–Nicolson with 240 nodes and 400 steps is only {=ch6.cnErr} yuan away from the formula. The tree, the formula and the equation are three computations of the same result. The formula is fastest but exists only for a few simple contracts; the tree and finite differences are slower but can handle early exercise, barriers and dividends, which the formula cannot.

The formula rests on a set of assumptions: the stock follows geometric Brownian motion (constant σ, no jumps); shares can be traded continuously with no cost; and money can be borrowed, lent and sold short freely at a single interest rate. Each of these is only an approximation in reality. The next two chapters first look at how sellers operate under it, then at where it goes wrong. {.take}

## The Greeks and Hedging: An Option Is a Bet on Volatility {#ch7}

::: strings
toc: The Greeks and hedging
:::

A seller of options holds Δ shares according to the formula and adjusts them as the price moves. The more often it is adjusted, the closer the final profit or loss is to zero; but on average it is zero only when the real volatility equals the volatility used in pricing. So what options really trade is volatility. {.law}

An insurer that sells car insurance does not simply wait to see whether accidents happen; it holds reserves and buys reinsurance to pass the risk on. A bank that sells options does the same. It does not bet on direction; it uses shares to hedge the direction away, and earns the small spread between buying and selling.

How to hedge depends on how sensitive the option's value is to each input. These sensitivities are named after Greek letters. For the call in the worked example (worth {=ch6.C} yuan):

{.gl}
- **Δ (Delta)** = ∂V/∂S = {=ch7.delta}. If the stock rises 1 yuan, the option rises by about {=ch7.delta} yuan. It is also the number of shares in the replicating portfolio. {#g1}
- **Γ (Gamma)** = ∂²V/∂S² = {=ch7.gamma}. If the stock rises 1 yuan, Δ rises by this much. The larger Γ, the more often the hedge must be adjusted. {#g2}
- **Vega** = ∂V/∂σ. If volatility is 1 percentage point higher, the option costs {=ch7.vega1} yuan more. Vega is not a Greek letter, but it is counted among the Greeks all the same. {#g3}
- **Θ (Theta)** = ∂V/∂t. With nothing else changing, the option loses {=ch7.thetaDay} yuan per day. {#g4}

::: lab ch7-model
model.title: Four sensitivities
model.how: Pick a Greek letter and drag the stock price and the time left. The curve shows how it varies with the stock price; the gold dot marks the current position. Drag the time left to a very short period to see Δ turn into a step and Γ become a sharp peak near the strike.
ctl.g: Which one
ctl.s: Stock price S
ctl.t: Time left
read.price: Option value
read.delta: Δ
read.gamma: Γ
read.vega: Vega (per percentage point)
read.theta: Θ (per day)
cv.x: Stock price (yuan) →
cv.y.delta: ↑ Δ
cv.y.gamma: ↑ Γ
cv.y.vega: ↑ Vega (yuan per percentage point)
cv.y.theta: ↑ Θ (yuan per day)
cv.aria: Line chart: the chosen Greek against the stock price
say.delta: Stock at {s} yuan, {t} left: Δ = {v}. The seller of this option holds {v} shares to hedge, and every move in the stock price means this number has to change.
say.gamma: Stock at {s} yuan, {t} left: Γ = {v}. A 1-yuan move in the stock changes Δ by {v}. The shorter the time and the closer to the strike, the larger Γ, and the harder the hedge is to keep up with.
say.vega: Stock at {s} yuan, {t} left: each percentage point of higher volatility makes the option cost {v} yuan more. The longer the time and the closer to the strike, the more sensitive it is to volatility.
say.theta: Stock at {s} yuan, {t} left: with nothing else changing, the option loses {v} yuan per day. The closer to expiry and the closer to the strike, the faster it decays.
:::

Γ and Θ are a pair. Compare the terms in the equation: once directional risk is hedged, the holder loses a little each day through Θ and gains a little from the stock's actual moves through Γ. If the actual volatility equals σ, the two average out. That is what the equation says.

::: diagram dg-loop keys=dg.loop
cap: Figure 6 The seller's hedging loop. When the stock rises, Δ grows and more shares must be bought; when it falls, some must be sold. The seller always buys high and sells low, losing a little on each turn. In the ideal case the premium received at the start is exactly enough to run the loop to the end: at expiry the shares held minus the loan equal the payoff owed to the buyer. Schematic.
aria: Diagram: selling an option collects the premium; buy Δ shares; the stock moves and Δ changes; buy or sell shares to restore Δ; the cycle repeats until expiry, when the payoff is paid and the position closed
b1: Sell option, collect premium
b2: Buy Δ shares
b3: Stock moves, Δ changes
b4: Buy or sell shares to restore Δ
end: Expiry: pay the payoff and close out
note: Rises: buy; falls: sell. Each turn loses a little.
:::

Now run the loop of Figure 6 for real. The seller prices at 20% volatility, collects {=ch6.C} yuan, adjusts the position a number of times during the year, and settles at expiry. Each random path gives a final profit or loss. Run {=ch7.paths} paths and plot the distribution.

::: lab ch7-hedge keys=ch7.h
model.title: Run the hedge more than a thousand times
model.how: First drag only the "rebalances per year": from once a year up to 252 times, the distribution of profit and loss gets narrower, but its centre stays near 0. Then drag "real volatility", which need not equal the 20% used for pricing: the whole distribution shifts. Press "New set" to draw new random numbers.
ctl.n: Rebalances per year
ctl.r: Real volatility
ctl.new: New set of paths
read.prem: Premium received
read.mean: Mean profit and loss
read.sd: Standard deviation of profit and loss
read.rel: Standard deviation ÷ premium
read.theory: Theoretical mean profit and loss
cv.x: Seller's profit or loss at expiry (yuan) →
cv.y: ↑ Number of paths
cv.zero: Zero profit and loss
cv.mean: Mean profit and loss
cv.aria: Histogram: the distribution of the seller's profit and loss at expiry after hedging
say.fair: Real volatility equals the 20% used in pricing. Rebalancing {n}× a year, the mean profit and loss is {mean} yuan (statistical error ±{se} yuan), with a standard deviation of {sd} yuan, which is {rel} of the premium. Multiply the number of rebalances by 4 and the standard deviation roughly halves.
say.calm: Real volatility is only {r}, below the 20% used in pricing: the seller earns {mean} yuan on average (theoretical {theory} yuan). The market is calmer than the seller assumed when setting the price, so buying high and selling low costs less than the premium received.
say.wild: Real volatility is {r}, above the 20% used in pricing: the seller loses {loss} yuan on average (theoretical {theory} yuan). No amount of rebalancing helps; more frequent rebalancing narrows the distribution but does not change its centre.
:::

Two results. First, with real volatility equal to 20%, rebalancing 4 times a year gives a standard deviation of profit and loss of {=ch7.sd4} yuan; 52 times gives {=ch7.sd52} yuan; 252 times gives {=ch7.sd252} yuan, which is only {=ch7.rel252} of the premium. The standard deviation shrinks roughly as 1/√n, and the mean stays near 0. This is what replication looks like in practice: the {=ch6.C} yuan is not a forecast of the option's payoff; it is the cost of hedging with Δ over a year.

Second, drag the real volatility to 30% and the seller's average loss is {=ch7.loss30} yuan; drag it to 10% and the average gain is {=ch7.gain10} yuan. The stock's average growth rate μ can change the size of this number (it decides how long the stock spends near the strike, where Γ is large), but not its sign; and when real volatility is 20%, the mean profit and loss stays near 0 whatever μ is. The seller bears exactly one risk: that real volatility differs from the volatility used in pricing. That is why traders say that **options trade volatility**. A buyer of an option is betting that future volatility will be larger than the price implies; a seller bets that it will be smaller. Whether the stock rises or falls does not matter to either side once the position is hedged.

This simulation has no transaction costs or bid–ask spreads, no price jumps, and constant volatility along each path. In reality, the more often you rebalance, the higher the trading costs, so there is no such thing as infinitely frequent hedging. Once the price jumps (Chapter 8), Δ cannot be adjusted in time, and the loss is one-off. The simulation uses μ = 4% (equal to the interest rate), and the figures in the second result depend on that choice. When real volatility equals the pricing volatility, another μ only adds a small bias from discrete rebalancing, which gets smaller the more often you rebalance. {.take}

## Where It Breaks Down {#ch8}

::: strings
toc: Where it breaks down
:::

If the formula's assumptions held, all options expiring on the same day would imply the same volatility. In the market they do not: the lower the strike, the higher the volatility implied in its price. The market is pricing in something the formula does not admit: crashes are far more common than a normal distribution allows. {.law}

Inside the formula, σ cannot be observed directly. So reverse the question: take an option's market price and ask, "what σ makes the formula produce this price?" The σ found this way is the **implied volatility**. It is another way of quoting the market price, just as a bond's price can be converted into a yield ([[interest-rates-bonds]]). The VIX index often cited in the news is a kind of implied volatility, calculated from the prices of S&P 500 options with roughly a month to expiry.

If the Black–Scholes world were true, options expiring on the same day with different strikes would all imply the same σ when inverted. Here is real data: the quotes for S&P 500 index options on the Chicago Board Options Exchange at the close on 17 November 2026.

::: lab ch8-model
model.title: One day of real quotes: implied volatility is not a flat line
model.how: Each point is an option at one strike. Its implied volatility is inverted from the midpoint of its bid and ask; the vertical bars show the range given by the bid and the ask separately. The horizontal axis is the strike divided by the forward price. Drag the slider to pick a strike and see how far the market price is from what the at-the-money volatility, plugged into the formula, gives. Then switch to the other expiry.
ctl.e: Expiry
ctl.k: Choose a strike
e.dec: 18 December 2026
e.mar: 19 March 2027
read.f: Forward price (read from parity)
read.atm: At-the-money implied volatility
read.iv: Implied volatility at chosen strike
read.mkt: Market price (midpoint)
read.flat: Formula with at-the-money volatility
cv.x: Strike ÷ forward price →
cv.y: ↑ Implied volatility
cv.pts: Inverted from market quotes
cv.flat: The formula's world: a flat line
cv.aria: Scatter plot: implied volatility of S&P 500 index options against strike, higher on the left and lower on the right
say.below: Strike {k} points, {off} below the forward: the market price of this {opt} is {mkt} points, with implied volatility {iv}. Plugging in the at-the-money {atm} gives only {flat} points. The market price is <em>{ratio}</em> the formula price.
say.above: Strike {k} points, {off} above the forward: the market price of this {opt} is {mkt} points, with implied volatility {iv}. Plugging in the at-the-money {atm} gives {flat} points; the market price is {ratio} that.
say.atm: Strike {k} points, almost exactly the forward: implied volatility {iv}, which is the at-the-money level. Drag left to see how much more expensive the put that protects against a crash is.
:::

The chart is not flat; it is higher on the left. In the December expiry group, the at-the-money implied volatility is {=ch8.atm}, and that of the put with a strike 10% below the forward is {=ch8.p90}. Put in price terms: this put's market price is {=ch8.ratio} times the price from plugging the at-the-money volatility into the formula. This shape is called a **volatility smile**. On stock indices it is lopsided, and it is also called a **skew**. Researchers have recorded that before the October 1987 crash the effect was barely visible on US index options, and that it has persisted since (Rubinstein, 1994).

The forward price of {=ch1.fDec} points shown on the chart uses no interest-rate or dividend data; it is read off the option prices. By the parity of Chapter 2, C − P plotted against the strike is a straight line; where it crosses zero is the forward price, and its slope is minus the discount factor (each point higher in strike lowers C − P by e<sup>−rT</sup> points). Parity does not depend on a model, so this step still holds where the smile exists.

What does the smile say? Cheap puts that protect against a crash sell for several times the formula price, which shows that both buyers and sellers think a large fall is much more likely than a normal distribution gives. The historical data show why they think so.

::: lab ch8-tails keys=ch8.t
model.title: Fifty-odd years of daily returns against a bell curve
model.how: The bars in the top chart are the log returns of the Nasdaq Composite over {=ch8.n} trading days, measured in units of its own standard deviation, on a logarithmic vertical axis; the cyan line is a normal distribution with the same mean and standard deviation. Drag the threshold: how many days actually exceeded it, against how many a normal distribution predicts. The bottom chart is about correlation. Returns themselves are almost uncorrelated from one day to the next, but the size of returns stays correlated for dozens of days.
ctl.k: Threshold (in standard deviations)
read.pct: Equivalent to a one-day move beyond
read.obs: Days observed
read.exp: Normal distribution predicts
read.ratio: Observed ÷ predicted
read.freq: Under a normal distribution
cv.x: Daily return (standard deviations) →
cv.y: ↑ Days (log scale)
cv.normal: Normal distribution
cv.data: Observed
cv.ax: Number of trading days apart →
cv.ay: ↑ Autocorrelation
cv.abs: Size of returns
cv.raw: Returns themselves
cv.aria: Histogram: the distribution of the index's daily returns on a logarithmic vertical axis, with a normal curve; the two tails lie far above the normal curve
cv.aaria: Line chart: autocorrelation of returns and of their sizes against the gap in trading days
say.some: A one-day move beyond {k} standard deviations ({pct}): the normal distribution predicts {exp} such days; the data has {obs}, {ratio} as many.
say.none: A one-day move beyond {k} standard deviations ({pct}): the normal distribution predicts {exp} such days, which is {freq}; the data has {obs} in {yrs} years.
:::

From {=ch8.from} to {=ch8.to}, across {=ch8.n} trading days of the Nasdaq Composite, the standard deviation of daily returns was {=ch8.sd}. For days beyond 5 standard deviations, the normal distribution predicts {=ch8.exp5} days, while {=ch8.obs5} were observed. The kurtosis of the distribution is {=ch8.kurt}; a normal distribution has 3. This is called **fat tails**. On 19 October 1987 the index fell {=ch8.oct19}, which is {=ch8.z87} standard deviations; under a normal distribution, a day like that has a probability of about 1 in 10 to the power {=ch8.log87}. On the same day the Dow Jones Industrial Average fell {=f.djia87}. The largest single-day fall in the sample was {=ch8.worstPct}, on 16 March 2020.

The lower chart shows another assumption that fails. The correlation between a return and the next day's return is only {=ch8.acfRaw1}, close to zero, so the direction is hard to predict. But the correlation between the sizes of returns one day apart is {=ch8.acfAbs1}, and it is still {=ch8.acfAbs20} twenty days apart: a large move is often followed by more large moves. This is called **volatility clustering**. In geometric Brownian motion σ is constant, so both lines should hug zero.

Two famous episodes record the cost of model failure. **Long-Term Capital Management (LTCM)** had Merton and Scholes among its partners. At the end of 1997 it held about {=f.ltcmLev} US dollars of debt for every US dollar of capital. After Russia defaulted in August 1998, spreads across markets moved against it all at once, and in a single month it lost {=f.ltcmAug} of its equity. On 23 September, {=f.ltcmFirms} banks and brokers injected about 3.6 billion US dollars and took it over. Its positions looked diversified on historical data, but in the crisis things that had been uncorrelated moved together (see the correlation discussed in [[diversification]]). **In 2008**, American International Group (AIG) sold large amounts of credit default swaps, guaranteeing bonds linked to mortgages. This is equivalent to selling deep out-of-the-money puts: steady premium income in calm times, and a total payout when things go wrong. On 16 September 2008 the New York Fed lent it up to 85 billion US dollars.

The implied volatilities here are inverted from midpoint prices; deep out-of-the-money options have wide bid–ask spreads, which the bars show. The return data come from one index (the Nasdaq Composite, from the FRED database of the St. Louis Fed). The numbers would differ for other indices and periods, but fat tails and clustering appear in all the major stock indices. I was unable to obtain long-run daily data for the S&P 500 from a public source, so it is not used. {.take}

## After the Formula: Stochastic Volatility, Margin and Clearing {#ch9}

::: strings
toc: After the formula: stochastic volatility, margin and clearing
:::

There are two ways to repair the model. Mathematically, let volatility itself be random and negatively correlated with the stock price, and a skew like the market's emerges. Institutionally, because models are wrong and counterparties can fail, require that profits and losses be settled at market prices every day, and that all trades be concentrated in one clearing house. {.law}

On the mathematical side: in 1993 Heston proposed a model in which the stock still follows geometric Brownian motion, but its instantaneous variance v also moves randomly, fluctuating around a long-run level θ. Deviations are pulled back at speed κ, the size of the randomness is set by ξ (the "volatility of volatility"), and the random shocks to the stock and to the variance have correlation ρ.

dS = rS·dt + √v·S·dW₁, dv = κ(θ − v)·dt + ξ√v·dW₂, where the correlation of dW₁ and dW₂ is ρ. {#heston .formula}

In equity markets ρ is negative: volatility tends to rise when prices fall. Downward paths then grow ever more turbulent, making large falls more likely, while upward paths become steadier. This model has no closed-form formula as simple as Black–Scholes', so below we use Monte Carlo directly: generate 20,000 paths, average the discounted payoff for each strike, and invert the implied volatilities as in the last chapter.

::: lab ch9-model
model.title: Let volatility be random and watch the skew appear
model.how: Drag the correlation ρ and the volatility of volatility ξ. Each point is an implied volatility inverted from a Monte Carlo option price; the vertical bars are two standard errors. The grey horizontal line is Black–Scholes at ξ = 0: 20%. Drag ρ from negative to positive and watch the curve flip from higher on the left to higher on the right.
ctl.rho: Correlation ρ
ctl.xi: Volatility of volatility ξ
ctl.new: New set of paths
read.atm: Strike 100
read.lo: Strike 80
read.hi: Strike 120
read.skew: Difference between 80 and 120
cv.x: Strike (yuan) →
cv.y: ↑ Implied volatility
cv.pts: Monte Carlo
cv.flat: Black–Scholes: 20%
cv.aria: Scatter plot: implied volatility from Monte Carlo under the Heston model, against strike
say.left: ρ = {rho}: the implied volatility at strike 80 is {lo}, and at 120 it is {hi}, {skew} higher on the left. When the stock falls, volatility rises, so low-strike options get dearer: the same direction as the real data in the last chapter.
say.right: ρ = {rho}: the implied volatility at strike 80 is {lo}, and at 120 it is {hi}, {skew} higher on the right. When the stock rises, volatility rises, so high-strike options get dearer. Some commodity options have this shape.
say.sym: ρ = {rho}: both wings are above the middle (80 is {lo}, 100 is {atm}, 120 is {hi}): a smile. It comes from the randomness of volatility itself; currency options often have this shape.
say.small: ρ = {rho}: 80 is {lo}, 100 is {atm}, 120 is {hi}; the two wings differ by less than 1 percentage point. With ξ this small and ρ near 0, the shape is hidden by the Monte Carlo's statistical error: it cannot be told whether it is a skew or a smile.
say.flat: ξ is very small: volatility barely moves at random, and the implied volatilities at all three strikes sit near {atm}, back to Black–Scholes.
:::

With the default parameters (ρ = {=ch9.rho0}, ξ = {=ch9.xi0}, six-month expiry), implied volatilities at strikes 80, 100 and 120 are {=ch9.iv80}, {=ch9.iv100} and {=ch9.iv120}: the skew has appeared. These parameters were chosen to make the shape clear; they are not a fit to any market. A real trading desk lets the model's parameters fit all of the day's option quotes; this is called **calibration**. The more complex the model, the better the fit, but a model that fits well does not guarantee good hedging. Other routes exist too: make volatility a function of the stock price and time (local volatility), or add jumps to the stock price.

Now the institutions. The arbitrage of Chapter 1 had an unstated premise: when the time comes, the counterparty really pays. A forward is worth 0 when it is signed, but as prices move over the year it becomes an asset for one side and a debt for the other, and the losing side may default or go bankrupt.

The futures exchanges' answer is **margin** plus **daily mark-to-market**. When a position is opened, each side posts **initial margin**, usually only a few to a dozen or so percent of the contract's value. After each day's close, profits and losses are computed at that day's settlement price, and the losing side pays the winner that same day. If the account falls below the **maintenance margin**, a **margin call** is issued; if it is not met, the position is forcibly closed out. In this way, neither side owes more than one day's loss.

The cost is **leverage**. A 10% margin means controlling 100 yuan of exposure with 10 yuan: if the price moves 1%, your capital moves 10%; if it moves 10% against you, the capital is gone.

::: lab ch9-margin keys=ch9.m
model.title: 120 days in a futures account
model.how: You buy a contract worth 100 yuan. Drag the initial margin ratio and the volatility of the price. The cyan line is the price; the gold line is the money in your account; red dots are margin calls. If "backup funds" is not ticked, the first call means forced closeout. Press "New path" to look at more paths.
ctl.im: Initial margin
ctl.sig: Annual volatility of the price
ctl.res: Backup funds to meet margin calls
ctl.new: New path
read.lev: Leverage
read.calls: Margin calls
read.out: Your profit or loss
read.raw: Held to the end without leverage
read.stat: Of 400 paths, forcibly closed out
cv.x: Trading day →
cv.y: ↑ yuan
cv.price: Price − 100
cv.eq: Account balance
cv.call: Margin call
cv.aria: Line chart: futures price changes and the margin account balance, with margin calls and forced closeouts marked
say.closed: On day {d} the account balance fell below the maintenance margin with no money to top it up, so the position was forcibly closed out at a loss of {loss} yuan, which is {frac} of the initial margin of {im} yuan. The price later reached {end} yuan. {after}
after.up: Had you been able to hold to the end, the trade would have made money, but you were no longer in the market.
after.down: Holding to the end would have lost even more.
say.calls: Margin calls over 120 days: {n}, with {paid} yuan topped up in total; the final profit or loss is {out} yuan. The price moved {raw} yuan in the end. With or without leverage the gain or loss is the same amount, but you had to be able to produce these {paid} yuan along the way.
say.quiet: Over 120 days the account balance never fell below the maintenance margin. The price moved {raw} yuan in the end; that is your profit or loss, which is {frac} of the {im} yuan of margin.
:::

With 10% margin, 20% annual volatility and no backup funds, {=ch9.closed} of 400 random paths were forcibly closed out within 120 days. Among them, the price finished above its starting level on {=ch9.won} of all paths: the direction was right, but the position did not last until that day. Leverage does not change the expected value of the bet; it changes whether you stay in the game.

Off-exchange contracts (agreed directly between two institutions) originally had no such machinery. After 2008, countries required that standardised OTC derivatives be cleared through a **central counterparty** (a clearing house). The clearing house steps into the middle of every trade, becoming the buyer to every seller and the seller to every buyer, and collects margin from both sides.

::: diagram dg-ccp keys=dg.ccp
cap: Figure 7 Debts among four institutions (the numbers are an example, in arbitrary units). Settled bilaterally, six pairs must be tracked; with all trades going through the clearing house, each firm faces only the clearing house, and the debts are netted multilaterally. Numbers computed by the page's model.
aria: Diagram: on the left, four institutions linked pairwise by six lines; on the right, four institutions each linked only to a central clearing house
t1: Bilateral settlement: 6 lines
t2: Through the clearing house: 4 lines
ccp: Clearing house
s1: Gross {=ch9.gross}, after bilateral netting {=ch9.bil}
s2: After multilateral netting {=ch9.ccp}
:::

In the example of Figure 7, the total owed among the four institutions is {=ch9.gross}. After each pair nets its debts, {=ch9.bil} remains. After multilateral netting through the clearing house, only {=ch9.ccp} actually has to be paid. The risk has not vanished; it has been concentrated in the clearing house. Its failure would be a systemic event, so it is protected layer by layer: by margin, by members' default funds and by its own capital.

In the Heston model, the initial variance and the long-run level are both 0.04 (that is, 20% volatility), with mean-reversion speed κ = 2. The Monte Carlo used the full-truncation Euler scheme, and the results carry statistical error. In the margin simulation, daily price changes are normal with no jumps, and the maintenance margin is 75% of the initial margin. Real markets do jump, and losses can exceed the money in the account. {.take}

## Uses and Harms {#ch10}

::: strings
toc: Uses and harms
:::

The same contract is insurance for someone with spot risk, and a leveraged bet for someone without it. How much risk a hedge can remove depends on how closely the contract's price is correlated with the price you actually worry about; beyond that ratio, the hedge becomes speculation. {.law}

A farm growing wheat, which will sell its crop in the autumn, fears prices falling. An airline that will need jet fuel next year fears prices rising. The farm sells wheat futures; the airline buys crude oil futures; each locks in part of a price that has not yet happened. They give up the benefit of prices moving their way, in exchange for being able to budget. This is the original purpose of derivatives, and the reason the contract of Chapter 1 exists.

But the contract you can buy is not necessarily exactly what you worry about. The airline burns jet fuel, while the most liquid futures contract is on crude oil; the farm's wheat differs from the grade and delivery location the exchange specifies. Two prices that are correlated but not identical: this difference is called **basis risk**. Let the standard deviation of the spot price be σ<sub>s</sub>, that of the futures price σ<sub>f</sub>, and their correlation ρ, and sell h futures per unit of spot. The variance of the hedged position is σ<sub>s</sub>² + h²σ<sub>f</sub>² − 2hρσ<sub>s</sub>σ<sub>f</sub>. It is smallest at h* = ρσ<sub>s</sub>/σ<sub>f</sub>, the **minimum-variance hedge ratio**; at that point the remaining standard deviation is √(1 − ρ²) of the original.

::: lab ch10-model
model.title: How many futures should the farm sell
model.how: The farm sells a batch of wheat in the autumn; the spot price is about 100 yuan with a standard deviation of 15 yuan. Drag the "hedge ratio" and the "correlation between futures and spot". The top chart shows 2,000 possible revenues: grey is unhedged, gold is hedged. The bottom chart shows the standard deviation of revenue against the hedge ratio; its lowest point is h*.
ctl.h: Hedge ratio h
ctl.rho: Correlation ρ
read.sd0: Standard deviation, unhedged
read.sd: Standard deviation, hedged
read.cut: Risk reduction
read.hs: Optimal ratio h*
read.best: Maximum reduction possible
cv.x: Revenue per unit of wheat (yuan) →
cv.y: ↑ Count
cv.raw: Unhedged
cv.hed: Hedged
cv.cx: Hedge ratio h →
cv.cy: ↑ Revenue std. dev. (yuan)
cv.aria: Histogram: the distribution of the farm's revenue before and after hedging
cv.caria: Line chart: the standard deviation of revenue against the hedge ratio, lowest at the optimal ratio
say.under: Hedge ratio {h}: the standard deviation falls from {sd0} yuan to {sd} yuan, a reduction of {cut}. The optimal {hs} has not yet been reached; selling more futures would reduce it further.
say.best: Hedge ratio {h}: the standard deviation falls from {sd0} yuan to {sd} yuan, a reduction of {cut}, close to the best possible at this correlation, {best}. What is left is basis risk, which futures cannot remove.
say.over: Hedge ratio {h}, beyond the optimal {hs}: standard deviation {sd} yuan, higher than at the optimum. The extra futures have no spot exposure behind them; they are a bet that the futures price falls.
say.spec: Hedge ratio {h}: standard deviation {sd} yuan, higher than the {sd0} yuan with no hedge at all. This is no longer hedging, but speculation with wheat as a cover.
:::

With ρ = 0.9, up to {=ch10.cut90} of the risk can be removed; with ρ = 0.7, only {=ch10.cut70}. Drag h past h* and further to the right, and the risk rises again, back to the unhedged level at twice h*. The contract itself cannot tell whether its holder is hedging or speculating; the only difference is whether he has that batch of wheat. Speculators are not without use: if the farm sells futures, someone has to buy them, and those willing to take on this risk are often speculators.

Leverage gives the same contract very different meanings for the two kinds of holder. For the farm, margin is only a deposit: losses on the futures are made up by the higher price of the wheat in the warehouse. For someone with no physical position, the account of the last chapter is everything: a small price move can wipe out the capital.

How large is the derivatives market? The figure most often cited is the **notional amount**: the sum of the amounts the contracts refer to. The Bank for International Settlements (BIS) reports that at the end of June 2025 the notional amount of global OTC derivatives was {=f.bisNotional} trillion US dollars. This is far larger than the world's annual output, but it is not money anyone can win or lose. An interest-rate swap with a notional of 100 million US dollars exchanges only the difference between two streams of interest; the 100 million of principal never changes hands. A figure closer to "what it would cost to close out now" is the **gross market value**: {=f.bisGmv} trillion US dollars on the same date, which is {=f.gmvPct} of the notional amount.

::: diagram dg-notional keys=dg.notional
cap: Figure 8 Notional amount and gross market value, drawn as two bars at the same scale (BIS, end-June 2025). When you read that the derivatives market is worth hundreds of trillions of dollars, it is the top bar that is meant.
aria: Diagram: two horizontal bars drawn to scale; notional amount 846 trillion US dollars; gross market value 21.8 trillion US dollars, about 2.6% of the former
n: Notional {=f.bisNotional} trillion US dollars
g: Gross market value {=f.bisGmv} trillion US dollars
:::

Evidence on retail outcomes is direct. By number of contracts traded, India is the largest index-options market in the world: according to the World Federation of Exchanges (WFE), 88.9% of the world's stock-index option contracts in 2025 traded on the National Stock Exchange of India. The Securities and Exchange Board of India (SEBI), in a study published in August 2026, tracked the profits and losses of about 7.86 million individual traders in equity derivatives over the financial year 2025–26: {=f.sebiLoss} of them lost money after transaction costs. Across the three earlier financial years, 2021–22 to 2023–24, the combined figure was {=f.sebiLoss3}. Among those who took part in all five financial years, only {=f.sebiWin5} made money every year, and {=f.sebiLose5} lost money every year. About {=f.sebiBuyers} of individual traders mainly bought options. US academic research (Bryzgalova, Pavlova and Sikorskaya, Journal of Finance, 2023) also finds that retail investors favour cheap weekly options, whose bid–ask spread averages 12.6% of the price, and that on average they lose money. These studies describe aggregates, not a forecast for any individual's result.

The statistics in this section show only what happened. Chapters 7 and 8 give two mechanical reasons why. Buying an option means paying Θ every day, and only real volatility above the volatility implied in the price can make that back. For short-dated, deep out-of-the-money options, the bid–ask spread is a large share of the price. The hedging model takes spot and futures prices to be jointly normal, with a constant correlation; in a crisis correlations jump, which is the lesson of LTCM. {.take}

## The Frontier, November 2026 {#ch11}

::: strings
toc: The frontier: November 2026
:::

The core mathematics has not changed in fifty years. What has changed is the market's shape: maturities down to the same day, contracts with no expiry date, clearing extended to government bonds, and hedging handed to neural networks. Each item below is dated and sorted into one of three groups: established; measured or demonstrated; or claimed by one side or still contested. {.law}

The figures in this chapter will go stale. Each entry is followed by the date it refers to; the sources, and the dates on which I opened them, are recorded in BRIEF.md in this page's directory.

### Established {#h.est .sub3}

{.fl}
- <span class="tag h">Established</span>The no-arbitrage pricing framework (replication, risk-neutral pricing, Black–Scholes–Merton) is textbook material and has not been overturned since 1973. What has been revised is its assumptions about the stock-price process (Chapters 8 and 9). {#e1}
- <span class="tag h">Established</span>LIBOR has been retired: the US-dollar LIBOR panel ceased publication on 30 June 2023. US-dollar interest-rate derivatives now mainly reference the Secured Overnight Financing Rate (SOFR), which stood at {=f.sofr} on 16 November 2026. About {=f.irdShare} of global notional is in interest-rate derivatives (BIS, end-June 2025), so this change of benchmark rewrites the largest block of the whole market. How interest rates themselves move all kinds of prices: see [[why-one-rate-moves-everything]]. {#e2}
- <span class="tag h">Established</span>Central clearing of US Treasuries: in December 2023 the US Securities and Exchange Commission adopted a rule requiring eligible Treasury cash and repo transactions to be cleared through a clearing house. On 25 February 2025 it extended the compliance dates by a year: 31 December 2026 for cash and 30 June 2027 for repo. A statement by SEC Commissioner Uyeda on 7 August 2026 still works towards these two dates; they have not been pushed back again. {#e3}

### Measured or demonstrated {#h.dem .sub3}

{.fl}
- <span class="tag m">Measured</span>The size of the OTC market (BIS): at the end of June 2025 the notional amount was {=f.bisNotional} trillion US dollars, up {=f.bisYoy} on a year earlier, and the gross market value was {=f.bisGmv} trillion US dollars. The International Swaps and Derivatives Association (ISDA), in its summary of the BIS data for end-2025, gives {=f.bisDecNotional} trillion and {=f.bisDecGmv} trillion US dollars; I have seen these figures only as ISDA's summary. The BIS triennial survey shows that OTC interest-rate derivatives turnover in April 2025 was {=f.triIrd} trillion US dollars a day. {#d1}
- <span class="tag m">Measured</span>Exchange volumes by number of contracts (Futures Industry Association, FIA): in 2025 global exchange-traded derivatives volume was 119.29 billion contracts, down {=f.fiaChg} from 2024. Options accounted for 88.65 billion, down {=f.fiaOptChg}; futures for 30.64 billion, up {=f.fiaFutChg}. FIA's statistics page says most of the fall came from equity contracts (down {=f.fiaEqChg} for the year); an FIA analysis of 26 February 2026 adds that the decline was overwhelmingly concentrated in Indian equity-index options, after the Securities and Exchange Board of India tightened its rules (larger minimum contract sizes, limits on weekly expiries, premiums collected upfront). Contract counts are not amounts of money: an Indian index-option contract, for example, is small in value. {#d2}
- <span class="tag m">Measured</span>Same-day expiries (0DTE): according to Cboe data, in July 2026 {=f.zeroShare} of S&P 500 index option volume expired the same day, the highest monthly share Cboe has published. In the second quarter of 2026, US-listed options averaged 72.8 million contracts a day; same-day expiries have averaged more than 20 million a day so far this year. As Chapter 7 showed, the closer to expiry, the larger Γ: the value of these contracts is extremely sensitive to the index in the last few hours. {#d3}
- <span class="tag m">Measured</span>Retail outcomes: see the SEBI study of August 2026 in Chapter 10. {#d4}
- <span class="tag m">Demonstrated</span>Perpetual futures: the most heavily traded derivatives in cryptocurrency markets have no expiry date. The arbitrage of Chapter 1 ties futures to spot by requiring the futures price to equal the spot price at expiry. A perpetual has no expiry, so it uses a **funding rate** instead: every few hours, when the contract price is above spot, longs pay shorts, and when it is below, shorts pay longs (Figure 9). He, Manela, Ross and von Wachter (arXiv:2212.06888, latest version 17 September 2026) derive a no-arbitrage price under frictionless assumptions, and find that actual prices deviate from it more in crypto markets than in traditional FX markets, and that the deviation has shrunk over time. {#d5}
- <span class="tag m">Demonstrated</span>Deep hedging: Bühler, Gonon, Teichmann and Wood (2018, arXiv:1802.03042) proposed not deriving Δ at all, but having a neural network learn how to hedge directly in simulated markets with transaction costs, and demonstrated it on markets generated by the Heston model. It sidesteps precisely the assumptions listed at the end of Chapter 7. Papers as recent as 2026 still test it on real S&P 500 index-option data. For example, Zernikov (arXiv:2605.21696, May 2026) reports that learned strategies usually hedge somewhat less than the Black–Scholes Δ and do better over most periods from 2015 to 2023, but are not stable in a year such as 2022. {#d6}

::: diagram dg-perp keys=dg.perp
cap: Figure 9 A futures contract with an expiry date pulls its price to spot through that date; a perpetual uses periodic funding payments. Schematic, not to scale.
aria: Diagram: in the top half, the futures price converges to spot at expiry; in the bottom half, a perpetual has no expiry, and when its price is above spot, longs regularly pay shorts a funding payment
t1: Futures with an expiry date
t2: Perpetual futures
spot: Spot price
fut: Futures price
perp: Contract price
exp: Expiry: the two prices must be equal
fund: Contract price too high: longs pay shorts
noexp: No expiry date
:::

### Claimed by one side, and still contested {#h.claim .sub3}

{.fl}
- <span class="tag l">Contested</span>Do same-day expiries amplify volatility? The concern rests on the loop in Figure 6: if market makers are net sellers of these options, then when the index moves they must keep buying and selling, and Γ is at its largest in the final hours. Cboe, which earns fees from these trades and is an interested party, said in a May 2025 report that buying and selling are balanced, that market makers' net hedging volume is at most {=f.mmGamma} of S&P 500 daily trading, and estimated retail's share of such trades at {=f.retailLo} to {=f.retailHi}. Academic findings disagree. The paper by Dim, Eraker and Vilkov finds no evidence that Γ in these options raises index volatility; the paper by Brogaard, Han and Won reports that the trading volume of these options goes with higher volatility. I have read only secondary summaries of these two papers, not the papers themselves. No accident has been widely accepted as caused by them to date, which does not prove that they cannot cause one. {#c1}
- <span class="tag l">Claimed</span>The size of the perpetual market: the data provider CryptoQuant states that global crypto perpetual-futures volume was about 61.8 trillion US dollars in 2025 (reports quote 61.7 or 61.8 trillion), against about 18.6 trillion for spot. Such figures come from exchanges' self-reported volumes; there are no regulatory statistics against which to check them, and I have not verified them. {#c2}
- <span class="tag l">Unresolved</span>The clearing house concentrates risk in one place. When it calls for more margin under stress, could that force members to sell and amplify the volatility? Regulators have debated this since the March 2020 market turmoil and the 2022 UK pension-fund crisis. Whether a hedge learned by a neural network can be trusted in market conditions it has never seen is open, and so is how complex a volatility model should be. None of these has a settled answer. {#c3}

Read this chapter with the date of each item in view. It contains no forecast of prices or of the direction of markets, and I am not in a position to make one. {.take}

## Closing: Four Questions to Ask of Any Derivative {#ch12}

::: strings
toc: Closing: four questions to ask of any derivative
:::

Back to the opening question. A bet can have a fair price not because someone knows the outcome, but because it can be assembled from other things that already have prices. The parts that cannot be assembled are the parts that are really being traded. {.law}

The next time you meet a derivative in the news, a financial report or a product description, you can ask four questions.

{.qs}
- **What can it be assembled from?** A forward is "buy the spot with borrowed money" (Chapter 1). An option is "Δ shares plus a loan", with Δ changing every moment (Chapters 3 and 7). When the price departs from the cost of assembling it, someone arbitrages the difference, so the price contains no prediction of rises or falls. {#q1}
- **What cannot be assembled?** For an option, it is volatility: a buyer bets that real volatility will exceed what the price implies; a seller bets that it will be smaller (Chapter 7). How much is in the price is seen from the implied volatility; how it varies with the strike shows how high the market has priced a crash (Chapter 8). {#q2}
- **What did the model assume, and which assumption fails first?** Constant volatility, no jumps, the ability to trade at any time, and no default by counterparties. Where things went wrong in history, it was almost always here: 1987, 1998 and 2008 (Chapter 8). {#q3}
- **Is it talking about notional amounts or about money that really changes hands? How much leverage is there, and who stands in the middle as guarantor?** Notional and gross market value differ by a factor of tens (Chapter 10). Margin decides whether a person can survive long enough to see the day they are right (Chapter 9). {#q4}

In one sentence: a derivative's price is the cost of a recipe, not a prophecy. Where the recipe can be written down, the price is firm; where it cannot, the price is the market's charge for risk. {#sum .sum}

Related pages: [[compound-interest]] (discounting), [[expected-value]] (expectation), [[binomial-normal]] and [[central-limit-theorem]] (where the bell curve comes from), [[monte-carlo]] (averaging over random numbers), [[risk-return]] and [[diversification]] (risk, return and correlation), [[interest-rates-bonds]] (interest rates and bond prices), and [[where-a-mortgage-payment-goes]] (interest and principal in a loan). Prerequisite pages the site still lacks: random walks and Brownian motion, the normal distribution itself, and the heat equation. {#links}

::: footer
**Sources.** J. C. Hull, Options, Futures, and Other Derivatives (cost of carry, parity, binomial trees, minimum-variance hedging; Chapters 1–4 and 10). F. Black and M. Scholes, The Pricing of Options and Corporate Liabilities, Journal of Political Economy 81(3), 1973; R. C. Merton, Theory of Rational Option Pricing, Bell Journal of Economics 4(1), 1973. J. C. Cox, S. A. Ross and M. Rubinstein, Option Pricing: A Simplified Approach, Journal of Financial Economics 7, 1979. P. Wilmott, S. Howison and J. Dewynne, The Mathematics of Financial Derivatives (finite differences). M. Kamal and E. Derman, When You Cannot Hedge Continuously, 1999; R. Ahmad and P. Wilmott, Which Free Lunch Would You Like Today, Sir?, Wilmott, 2005. S. L. Heston, A Closed-Form Solution for Options with Stochastic Volatility, Review of Financial Studies 6(2), 1993; R. Lord, R. Koekkoek and D. van Dijk, A comparison of biased simulation schemes for stochastic volatility models, Quantitative Finance 10(2), 2010.

**Data.** S&P 500 index option quotes: Cboe delayed quotes, close of 17 November 2026, obtained 18 November 2026. The page carries only the bid and ask quotes for 19 strikes at each of two expiries. Nasdaq Composite daily closes: St. Louis Fed FRED database (series NASDAQCOM), 5 February 1971 to 16 November 2026, obtained 18 November 2026. The page carries only the histogram and the correlations computed from it. The facts in Chapters 8, 10 and 11 come from the Bank for International Settlements, the Futures Industry Association, the Chicago Board Options Exchange, the Securities and Exchange Board of India, the US Securities and Exchange Commission, the New York Fed and Federal Reserve History. URLs and opening dates are in BRIEF.md in this page's directory.

**Models and notes.** All models are computed instantly in the browser, with random numbers from fixed seeds. What each model leaves out is written in the last paragraph of its chapter. This essay explains only mathematics and market structure. It is not investment advice and it forecasts no prices. Claude (Anthropic's AI) wrote it in November 2026; another Claude model reviewed it independently on 25 November 2026.
:::
