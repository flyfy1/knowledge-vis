---
lang: en
title: Random Walks and Brownian Motion · A Hands-on Essay
desc: A walker who flips a coin for every step goes nowhere on average, yet drifts ever further from the start, by the square root of the number of steps. From that one fact: why variances add, how Einstein and Perrin counted molecules from jiggling grains, geometric Brownian motion and annualised volatility σ√T, where a real index stops looking like a random walk, and on to gambler's ruin, option pricing and AI diffusion models. Eight hands-on models; mathematics and evidence only, not investment advice.
---

::: strings
nav.back: ← Knowledge index
nav.lang: Language
toc.label: Contents
toc.title: Contents
u.pct: {v}%
u.um2: {v} µm²/s
u.um: {v} µm
u.s: {v} s
u.min: {v} min
u.h: {v} h
u.d: {v} days
u.y: {v} yr
u.yuan: ¥{v}
u.bets: {v} bets
u.days: {v} trading days
u.steps: {v} steps
u.times: {v} times
:::

# Random Walks and Brownian Motion {#hero}

::: strings
kicker: Probability & Statistics · Stochastic Processes · A Hands-on Essay
:::

Why does anything random wander away from its start<br>by the square root of time? {.sub}

Someone flips a coin every second: heads, one step right; tails, one step left. On average they go nowhere, yet they get further and further from where they began: about 10 steps away after 100 steps, about 100 steps away after 10,000. This square-root law turns up all over the place: the jiggling of tiny grains in water, a drop of ink spreading, how widely a share price ranges over a year, how many bets it takes a gambler to go broke, and how today's image-generating AI turns a picture into noise and back again. {.lead}

The page has eight chapters, and the first seven each have a model you can drag. Every number in the text is computed by the page's own models and checked by a test script. The chapters that touch shares cover only mathematics and historical data; they are not investment advice. It was written by Claude Code (claude-opus-5-5). Every model is a simplification, and chapter 5 uses real data to show where they fail. {.note}

## The drunkard's walk: going nowhere, getting further {#ch1}

::: strings
toc: The drunkard's walk
:::

Left or right with equal odds: after n steps the average position is still 0, but the typical distance is √n. {.law}

Picture a very long corridor with someone standing in the middle, flipping a coin each second to decide which way to step. Ask where they will be in a minute and the honest answer is "can't say, but probably near the middle". Ask about an hour from now and the answer changes: still can't say, but "near" has become much wider.

Write each step as +1 or −1. After n steps the position S<sub>n</sub> is a sum of n terms of ±1. Left and right are equally likely, so **the average position is 0**. But an average of 0 does not mean they stay put. To measure "how far away" we square: each step squared is 1, different steps are uncorrelated so the cross terms average to 0, and the average of S<sub>n</sub>² is exactly n. **The root-mean-square distance is √n**.

::: diagram dg-lattice keys=dg.lat
cap: Figure 1. Every possible path in four steps. The number on each node counts the routes that reach it (Pascal's triangle). Only 1 route ends at +4, while 6 return to 0, so the middle is most common and the ends rarest.
aria: Diagram: lattice of a four-step random walk, each position labelled with the number of routes to it, 1, 4, 6, 4, 1
step: steps
pos: position
:::

::: lab ch1-model
model.title: Two hundred walkers at once
model.how: Press Start: everyone flips their own coin at every step. The gold curves are ±√n, the faint ones ±2√n. Watch the crowd spread, and compare the share inside ±√n with the exact binomial value next to it. Change the number of walkers, or press Restart for fresh random numbers.
ctl.m: Walkers
ctl.run: Start
ctl.pause: Pause
ctl.reset: Restart
read.n: Steps taken
read.rms: Measured RMS distance
read.sqrt: √n
read.in: Inside ±√n (measured)
read.exact: Inside ±√n (exact)
cv.x: steps →
cv.y: ↑ position
cv.aria: Line chart: two hundred random-walk paths fanning out inside a square-root envelope
say: After {n} steps the crowd's RMS distance from the start is <em>{rms}</em> steps, against √n = {sqrt}. {in} of them are inside ±√n; the exact binomial value is {exact}.
:::

At n = 100 the exact share is {=ch1.in100}: about three in four walkers are no more than 10 steps from the start. Inside ±20 steps are {=ch1.in2_100}. As n grows the share approaches the normal distribution's 68%; at n = 10,000 it is {=ch1.in10000}.

Watch out for a common mix-up. √n is the **root-mean-square** distance, not the "average distance". At n = 100 the average distance from the start is {=ch1.abs100} steps, not 10. For large n the average distance is about {=ch1.ratio} × √n. Both grow as √n; only the constant differs. {.take}

## Why a square root: variances add {#ch2}

::: strings
toc: Variances add
:::

Add independent random quantities and their variances add, while their standard deviations do not. n steps have n times the variance of one, so the spread grows only √n times. {.law}

Two independent jolts: one moves you 1 metre east, the other in a direction that has nothing to do with the first. How far apart do you end up, on average? Not 2 metres, because directions partly cancel; not 0, because they never cancel fully. The answer is √2 metres, just like the hypotenuse of a right triangle: in the bookkeeping of variance, two independent random quantities behave like two perpendicular sides (see [[pythagoras]]).

Carry on: n steps each of variance 1 give a total variance of n, so a standard deviation of √n. This needs only two things: each step has a finite variance, and steps are uncorrelated. **It does not need the steps to be coin flips**. The model below swaps in three very different kinds of step, all with variance 1.

::: diagram dg-pyth keys=dg.pyth
cap: Figure 2. Independent random quantities are "perpendicular" in variance: two steps have standard deviation √2, four have √4 = 2. The spread grows with the square root of the number of steps, not with the number itself (schematic).
aria: Diagram: two independent unit steps act like the legs of a right triangle, giving a combined standard deviation of √2; four steps give 2
one: 1 step: width 1
two: 2 steps: width √2
four: 4 steps: width √4 = 2
rule: variances add: 1 + 1 + 1 + 1 = 4
:::

::: lab ch2-model
model.title: Change the step, the width is still √n
model.how: Pick a kind of step and drag the number of steps n. The bars are the positions of 4,000 walkers after n steps; the cyan curve is a normal distribution with standard deviation √n. The "lopsided" step jumps far right a quarter of the time and shuffles a little left otherwise: it is very asymmetric, so watch how many steps it takes to become a bell.
ctl.type: Each step
type.coin: Coin ±1
type.uniform: Uniform jitter
type.lopsided: Lopsided
ctl.n: Steps n
read.sd: Measured SD
read.th: Theory √n
read.skew: Measured skewness
read.skth: Theory skewness
cv.x: position after n steps (in units of √n) →
cv.y: ↑ walkers
cv.normal: normal curve
cv.aria: Histogram: end positions of four thousand random walks with a normal curve of standard deviation root n
say: After {n} steps the 4,000 positions have a standard deviation of <em>{sd}</em>, against √n = {th}. Skewness {skew} (theory {skth}): the closer to 0, the more symmetric the bell.
:::

All three kinds of step give width √n, a direct consequence of variances adding. The shape also heads for the same bell: that is the **central limit theorem**, under which a sum of many independent small pieces tends to a normal distribution whatever each piece looks like. It is not re-taught here: the bell on a Galton board is in [[binomial-normal]], and why sums become normal and what variance is are in [[concept:gaussian]] and [[concept:variance]]. One lopsided step has skewness {=ch2.skew1}; after 100 steps it is down to {=ch2.skew100}, fading as 1/√n.

Read the same rule backwards and you get "the error of an average shrinks as 1/√n": a sum of n independent errors is √n wide, and dividing by n to take the average leaves a width of 1/√n. Quadrupling the sample only halves the error in [[monte-carlo]], and ten thousand people sharing a risk in [[risk-pooling]] works the same way. {.take}

## Brownian motion: molecules you can see {#ch3}

::: strings
toc: Brownian motion
:::

Make the steps of a random walk infinitely small and infinitely fast and you get Brownian motion. How fast it spreads is set by one number, the diffusion coefficient D: along each axis, ⟨x²⟩ = 2Dt. {.law}

In the summer of 1827 the botanist Robert Brown saw through his microscope that tiny particles released from pollen grains in water jiggled without stopping, and that powdered rock jiggled just the same, so it was not a "life force". The jiggling became known as **Brownian motion**. For nearly eighty years nobody could say where it came from.

In 1905 Einstein explained it: water molecules hit the particle from every side, each blow tiny, but never quite balanced, so the particle shuffles along like a random walk (how molecular impacts make pressure is in [[kinetic-theory]]). His key move was to stop chasing the particle's velocity (too fast to see) and look instead at **how the square of its displacement grows with time**. Just as in chapter 1, the mean square displacement along one axis is proportional to time:

⟨x²⟩ = 2Dt,  D = k<sub>B</sub>T ⁄ (6πηa) {#eq1 .eq}

Here T is the temperature, η the viscosity of water, a the particle's radius and k<sub>B</sub> Boltzmann's constant. The second formula is the Stokes–Einstein relation. It ties something you can see (with a microscope), ⟨x²⟩, to something you cannot, k<sub>B</sub>. And k<sub>B</sub> times Avogadro's number is the gas constant R, so **measuring how widely a particle wanders counts the molecules in a mole**.

::: diagram dg-einstein keys=dg.ein
cap: Figure 3. Einstein's chain of argument (schematic): molecular impacts → the particle performs a random walk → measuring ⟨x²⟩ gives D → the Stokes–Einstein relation gives k<sub>B</sub> → R = N<sub>A</sub>k<sub>B</sub> gives Avogadro's number.
aria: Diagram: five-step chain of argument from molecular impacts to Avogadro's number
a: molecular impacts
b: random walk
c: measure ⟨x²⟩ → D
d: D → k_B
e: R ÷ k_B → N_A
:::

In 1908–1909 the French physicist Jean Perrin did exactly that. He ground gamboge resin into spheres of nearly equal size, recorded their positions under the microscope every few tens of seconds, and found that the squared displacement did grow in proportion to time. The Avogadro number he got from it agreed with the one from his measurements of how the grains settle under gravity, and with those from entirely different methods. That largely ended the argument over whether atoms are real. In 1926 he received the Nobel Prize in Physics for "his work on the discontinuous structure of matter".

::: lab ch3-model
model.title: A cloud of grains spreading in water
model.how: Three hundred grains start at the centre, each doing a random walk along each axis; the gold one leaves a trail. Drag the grain radius and the water temperature: D comes from the Stokes–Einstein relation. Check the measured ⟨x²⟩ against 2Dt, then look at the three "how long" readouts: spreading 10 µm, 1 mm, 1 cm.
ctl.a: Grain radius
ctl.t: Water temperature
ctl.reset: Restart
read.D: Diffusion coefficient D
read.t: Time elapsed
read.msd: Measured ⟨x²⟩
read.th: 2Dt
read.t10: Spread 10 µm
read.t1mm: Spread 1 mm
read.t1cm: Spread 1 cm
cv.scale: 10 µm
cv.aria: Animation: three hundred grains start at the centre and spread by Brownian motion, one of them leaving a trail
say: Radius {a}, water at {t}: D = {D}. After {time} of simulated time the measured ⟨x²⟩ per axis is <em>{msd}</em>, against 2Dt = {th}. Spreading 1 cm takes {t1cm}.
:::

The default is a bead of radius 0.5 µm in water at 20 °C: D = {=ch3.Db} µm²/s, and its RMS displacement along one axis in one second is {=ch3.rms1} µm. Spreading 10 µm takes {=ch3.t10} seconds, 1 mm takes {=ch3.t1mm} days, and 1 cm takes {=ch3.t1cm} years. Warm the water to 37 °C and it gets thinner: D rises to {=ch3.Db37} µm²/s.

Drag the radius to its minimum (0.5 nm, about the size of a sugar molecule) and D is roughly {=ch3.Dm} µm²/s: 10 µm takes only {=ch3.m10} seconds, but 1 cm takes {=ch3.m1cm} days. That is the other face of the square-root law: **ten times the distance takes a hundred times as long**. Diffusion moves things quickly across a cell (see [[membrane-transport]]), sugar in unstirred tea takes ages, and any animal bigger than a speck needs a circulation.

The Stokes–Einstein relation treats a molecule as a small sphere in water, so for small molecules it is only an order-of-magnitude estimate. Einstein's ⟨x²⟩ = 2Dt also fails over very short times, where the particle still carries its inertia; chapter 8 describes the 2010 measurement. {.take}

## Drift plus noise: geometric Brownian motion {#ch4}

::: strings
toc: Geometric Brownian motion
:::

Treat the logarithm of a share price as "steady drift plus a random walk": the drift grows with time T, the noise with √T. So the short run is almost all noise and the drift shows only over longer horizons; to move an annual volatility to another horizon, multiply by √T. {.law}

In 1900 the French mathematician Louis Bachelier, in his doctoral thesis *Théorie de la spéculation*, used a random walk for prices on the Paris Bourse, writing down the same kind of mathematics five years before Einstein. But he let the price itself wander, so it could go negative. The later standard is to let the **logarithm of the price** wander: each step is a small percentage change rather than a fixed amount of money.

Why logarithms? Up 10% then down 10% does not bring you back: 100 becomes 110, then 99. In logarithms, up 10% is +0.095 and down 10% is −0.105, and the two add up to something negative. Only on the log scale do independent percentage changes become random steps that add, so that chapter 2's rule applies (logs turn multiplication into addition; see [[concept:exp-log]]).

::: diagram dg-log keys=dg.log
cap: Figure 4. Up 10% then down 10%, or the other way round, takes 100 to 99 either way. Percentages do not add; logarithms do: +0.095 and −0.105 sum to −0.010. Geometric Brownian motion is a random walk on the log scale.
aria: Diagram: 100 rises ten percent to 110 then falls to 99; the other route falls to 90 then rises to 99; log changes marked beside each leg
up: up 10%
dn: down 10%
log: log changes add
:::

This model is **geometric Brownian motion**: dS/S = μ dt + σ dW, where μ is the mean growth rate, σ the volatility and dW a small step of Brownian motion. Its solution: after T years, ln(S<sub>T</sub>/S<sub>0</sub>) is normally distributed with mean (μ − σ²/2)T and standard deviation σ√T. The extra −σ²/2 in the mean is exactly the "up 10%, down 10%, not back" above.

::: lab ch4-model
model.title: When does drift beat noise?
model.how: Thirty paths start at ¥100; the cyan band is one standard deviation either side of the median. Drag the mean growth rate μ, the volatility σ and the horizon T. Watch two things: how the chance of ending below the start changes with the horizon, and how many years it takes the drift to catch up with one standard deviation of noise.
ctl.mu: Mean growth μ
ctl.sig: Volatility σ
ctl.T: Horizon T
read.med: Median
read.mean: Mean
read.loss: Chance of ending below the start
read.star: Drift catches the noise after
read.never: never
cv.x: time (years) →
cv.y: ↑ price (¥, log scale)
cv.aria: Line chart: thirty geometric Brownian motion paths and a band one standard deviation around the median, log vertical axis
say.noise: After {T}: log drift {drift}, noise standard deviation {noise}; the noise is bigger. The chance of ending below the start is <em>{loss}</em>.
say.drift: After {T}: the log drift {drift} now exceeds the noise standard deviation {noise}, and the chance of ending below the start is down to <em>{loss}</em>.
say.neg: Too volatile: μ − σ²/2 = {m} is not positive, so the median path heads down. The mean, {mean}, is still above the start, carried by a few paths that rise a lot; the chance of ending below the start is <em>{loss}</em>.
:::

With the defaults μ = 7% and σ = 20% the log drift is 5% a year. After one year the chance of ending below the start is {=ch4.loss1}; after ten years it is {=ch4.loss10}. The drift 0.05T catches up with the noise 0.2√T after {=ch4.tStar} years, when the chance of a loss is {=ch4.lossStar} (one tail of the normal beyond one standard deviation). After ten years the median is ¥{=ch4.med10} and the mean ¥{=ch4.mean10}: a few big winners pull the mean up. Drag σ to 40% and the ten-year median is ¥{=ch4.med10s40}, below the start, while the mean does not change. In a multiplicative random walk the median grows more slowly than the mean; this is the same thing as [[concept:mean-vs-median-long-tail]].

**Annualised volatility** is σ: the standard deviation of one year's log return. To go from daily data to a year, chapter 2's rule says multiply by √(trading days per year). Since 1971 the daily log returns of the NASDAQ Composite index have had a standard deviation of {=ch4.daily}; with about {=ch4.perYear} trading days a year, that annualises to {=ch4.ann}. That conversion **assumes daily returns are uncorrelated**, which is to say it assumes a random walk. The next chapter checks the assumption.

√T describes how risk grows when you hold the same asset for longer; [[risk-return]] is about how risk and return relate, and [[diversification]] goes the other way: many assets held at the same moment, and how their risks partly cancel. Both use the same rule that variances add.

Geometric Brownian motion is where option pricing starts. The same model appears in <a href="../../../investment/derivatives/a-fair-price-for-a-bet/#ch5">chapter 5 of the companion essay "A Fair Price for a Bet on the Future"</a> with the end points of 4,000 paths, and that essay goes on to price options with a binomial tree and the Black–Scholes formula. The model assumes constant volatility, independent steps and no jumps. All of these are approximations, and none of it is investment advice: the model describes one possible world, not the future of any particular share. {.take}

## Is the market a random walk? {#ch5}

::: strings
toc: Is the market a random walk?
:::

In direction, nearly: today's move tells you almost nothing about tomorrow's. In size, no: big moves are far more common than a normal distribution allows, and they cluster; and in some eras the variance of returns does not grow in proportion to time. {.law}

In 1970 Eugene Fama set out the idea that "prices already reflect public information" as the **efficient market hypothesis**. One consequence: if any predictable part of price changes gets traded away by people acting on it first, what is left should look close to a random walk. The economic claim itself and the argument over it belong to the companion essay on what a share is worth (not yet published). Here is only what it means mathematically and what it does not: a random walk says **changes cannot be predicted from past prices**. It does not say prices are "right", it does not rule out a positive average return (chapter 4's drift), and it certainly does not say volatility is constant.

So this chapter only runs statistical tests: does real data show the two fingerprints of a random walk, **width growing as √T**, and **a shape close to normal**?

The data are daily closes of the NASDAQ Composite index from February {=ch5.from} to {=ch5.to} (FRED database, Federal Reserve Bank of St. Louis): {=ch5.n} daily returns. The page carries only summary statistics, never the daily prices.

::: lab ch5-model
model.title: Adding daily returns into weeks, months and quarters
model.how: Pick a horizon. The bars are log returns over that horizon (non-overlapping sums of 1, 5, 21 or 63 trading days), in units of their own standard deviation, on a log vertical scale; the cyan line is the normal distribution that geometric Brownian motion predicts. Watch the kurtosis (3 for a normal distribution) and the ratio of the actual width to "daily SD × √days".
ctl.q: Horizon
q.1: 1 day
q.5: 1 week
q.21: 1 month
q.63: 1 quarter
read.n: Sample size
read.sd: Actual SD
read.pred: Daily SD × √days
read.ratio: Actual ÷ predicted
read.kurt: Kurtosis
read.o4: Beyond 4 SD: actual / normal
cv.x: return (multiples of SD) →
cv.y: ↑ count (log scale)
cv.normal: normal
cv.data: actual
cv.aria: Histogram: NASDAQ Composite log returns over the chosen horizon, log vertical axis, with a normal curve
say: {q} returns: the actual standard deviation is <em>{ratio}</em> times "daily SD × √days", and the kurtosis is {kurt} (3 for a normal). {o4} returns lie beyond 4 standard deviations, where a normal distribution expects {e4}.
:::

Daily returns have a kurtosis of {=ch5.k1}. There were {=ch5.o4} days beyond 4 standard deviations, where a normal distribution expects only {=ch5.e4}. These are **fat tails**. In 1963 Mandelbrot had already seen them in cotton prices and proposed replacing the normal with fatter-tailed "stable" distributions. Add the days into longer horizons and the kurtosis falls steadily: {=ch5.k5} for a week, {=ch5.k21} for a month, {=ch5.k63} for a quarter. Many not-so-fat days added together drift toward a bell, which is chapter 2's central limit theorem at work. As for width, the actual standard deviation of monthly returns is {=ch5.r21} times the √21 prediction, and of quarterly returns {=ch5.r63} times: a little wider than a random walk predicts.

How fat the tails are decides whether chapter 2's rule still works. If the tail decays as a power law, P(|X| > x) ∝ x<sup>−α</sup>, then for α < 2 the variance is infinite and "variances add" stops meaning anything: the width of a sum of n steps grows as n<sup>1/α</sup>, faster than √n, and the sum no longer tends to a normal but to one of Mandelbrot's **stable distributions** (also called Lévy stable laws). Measured with the Hill estimator on the largest 1% of days in these data ({=ch5.k1n} days), the tail exponent α is {=ch5.a1}; on the largest 2.5% it is {=ch5.a25}. α is above 2, so the variance is finite and the central limit theorem still wins in the end, only slowly, which is exactly the falling kurtosis above. Gopikrishnan and colleagues (1998) also measured α of about 3 in high-frequency data on US shares, the "inverse cubic law". In a long tail the mean and the median part ways; see [[concept:mean-vs-median-long-tail]].

The other way the data are unlike a random walk is **volatility clustering**. Measured over 21 trading days and annualised, volatility was as low as {=ch5.vmin} ({=ch5.vminDate}) and as high as {=ch5.vmax} ({=ch5.vmaxDate}). In geometric Brownian motion σ is a constant; the real σ wanders randomly itself, and big moves tend to follow big moves.

::: diagram dg-vr keys=dg.vr
cap: Figure 5. Variance ratio VR(q) = variance of q-day returns ÷ (q × variance of one-day returns). It is 1 for a random walk, above 1 when moves persist (momentum), below 1 when moves tend to reverse (mean reversion) (schematic).
aria: Diagram: three price paths for a variance ratio above one, equal to one and below one
gt: VR > 1: moves persist
eq: VR = 1: random walk
lt: VR < 1: moves reverse
:::

The standard tool for testing "width grows as √T" is the **variance ratio**, made systematic by Andrew Lo and Craig MacKinlay in 1988. Using weekly returns on US shares from 1962 to 1985 they rejected the random walk strongly, mostly because of small stocks, and argued that this could not be put down entirely to small stocks trading infrequently (a share that goes days without trading leaves a "stale" price in the index, which creates spurious persistence).

::: lab ch5-vr keys=ch5.v
model.title: Variance ratios, era by era
model.how: Pick an era and a horizon q. The gold dots are the actual variance ratios. The grey band is the middle 95% of variance ratios after shuffling that era's daily returns {=ch5.shuffles} times: shuffling keeps the fat tails but destroys any link between one day and the next. A dot outside the band means that era does not look like a random walk.
ctl.era: Era
era.all: All
era.e1: 1971–1989
era.e2: 1990–2009
era.e3: 2010 on
ctl.q: Horizon q
read.vr: Actual variance ratio
read.band: Shuffled 95% range
read.acf: Correlation of consecutive days
cv.x: horizon q (trading days, log scale) →
cv.y: ↑ variance ratio
cv.aria: Scatter plot: variance ratio at each horizon and the range after random shuffling
say.above: {era}, {q} trading days: variance ratio <em>{vr}</em>, above the shuffled range {lo}–{hi}. Moves persist, and the width grows faster than √T.
say.below: {era}, {q} trading days: variance ratio <em>{vr}</em>, below the shuffled range {lo}–{hi}. Moves tend to reverse, and the width grows more slowly than √T.
say.inside: {era}, {q} trading days: variance ratio {vr}, inside the shuffled range {lo}–{hi}; it cannot be told apart from a random walk.
:::

The answer changes a lot from era to era. In 1971–1989 the correlation between consecutive days was as high as {=ch5.e1acf}, and the one-month variance ratio was {=ch5.e1vr21}: NASDAQ was then mostly small companies, many of them thinly traded, exactly the situation Lo and MacKinlay describe. In 1990–2009 the ratio was {=ch5.e2vr21}, indistinguishable from a random walk. Since 2010 it has gone the other way: consecutive days correlate at {=ch5.e3acf}, and the one-month ratio, {=ch5.e3vr21}, is below the bottom of the shuffled range, {=ch5.e3lo21}.

Taking all eras together, the one-month variance ratio is {=ch5.allvr21}, just above the top of the range, {=ch5.allhi21}, but that comes mostly from the 1970s and 1980s. Across individual shares, researchers have also recorded two patterns pointing opposite ways: shares that rose most over the past 3–12 months tend to keep beating the rest over the next 3–12 months (momentum; Jegadeesh and Titman, 1993), while 3–5-year returns tend to reverse (Fama and French; Poterba and Summers, 1988). Such patterns often weaken once published: McLean and Pontiff (2016) looked at 97 predictors and found average returns 58% lower after publication than in the original samples.

The shuffled band is only a rough test: shuffling also destroys volatility clustering, which makes the variance ratio itself noisier, so the band is drawn too narrow and "outside the band" is not strict statistical significance. Conclusions from one index and one data source do not carry over automatically to other markets. {.take}

## Hitting a wall: gambler's ruin {#ch6}

::: strings
toc: Gambler's ruin
:::

A fair random walk sooner or later hits any wall, and covering a distance d takes d² steps on average. If each step is even slightly against you, the more you bet, the likelier you are to lose everything. {.law}

A gambler walks into a casino with ¥50, bets ¥1 a round, and plans to leave on reaching ¥100 or when broke. Their bankroll is a random walk with a wall at each end. Questions about "the first time a line is touched" are called **first passage** problems. A knock-out option, a company defaulting and an insurer's reserves being wiped out by claims (see [[risk-pooling]]) are all problems of this kind.

[[markov-chains#step5|Step 6 of "Markov Chains"]] derived the gambler's-ruin formula with a transition matrix. Here is another angle: play the same game in two ways, "¥1 a round" and "bold play" (each time stake exactly enough to reach the target, or everything you have, whichever is less), and compare the chance of success and the number of rounds.

::: diagram dg-ruin keys=dg.ruin
cap: Figure 6. The gambler's bankroll does a random walk between 0 and the target N and stops on touching either end (the "absorbing barriers"). Starting from i, the chance of touching the top first is the chance of success (schematic).
aria: Diagram: a bankroll starts at i and wanders between the lines 0 and N, stopping when it touches either
top: target N: leave a winner
bot: 0: broke
start: start i
:::

::: lab ch6-model
model.title: ¥1 a round, or bold play?
model.how: Drag the starting bankroll, the target and the chance p of winning each round. The default p = 18/37 is the chance of red on a European roulette wheel (18 red pockets out of 37). The chart shows twelve "¥1 a round" bankrolls. The success chances and average numbers of rounds for both ways of playing are exact.
ctl.i: Starting bankroll
ctl.N: Target
ctl.p: Win chance p
ctl.preset: Presets
pre.red: Roulette red 18/37
pre.fair: Fair 1/2
pre.edge: Slight edge 0.52
read.timid: ¥1 a round: success
read.timidN: ¥1 a round: average rounds
read.bold: Bold play: success
read.boldN: Bold play: average rounds
cv.x: rounds →
cv.y: ↑ bankroll (¥)
cv.aria: Line chart: twelve gambler bankroll paths wandering between zero and the target until they touch one of the lines
say.unfav: Each round is against you (p = {p}): betting ¥1 a round succeeds only <em>{timid}</em> of the time and takes {tn} rounds on average; bold play succeeds <em>{bold}</em> of the time. The more you play, the more the house's small edge piles up.
say.fair: A fair game: both ways succeed {timid} of the time, exactly the starting bankroll ÷ the target. But ¥1 a round takes {tn} rounds on average, the square of the distance.
say.fav: Each round is in your favour (p = {p}): ¥1 a round succeeds <em>{timid}</em> of the time; bold play only {bold}. The side with the edge wants to play many rounds and let the law of large numbers work for it.
:::

With the defaults, ¥50 to ¥100 betting on red: ¥1 a round succeeds only {=ch6.t50} of the time and takes {=ch6.n50} rounds on average; staking all ¥50 at once succeeds with the chance of a single round, {=ch6.b50}. From ¥20 to ¥100, ¥1 a round succeeds {=ch6.t20} of the time, bold play (stake 20, then 40, then as needed) {=ch6.b20}.

Set p to 1/2 and both ways succeed equally often, with chance i/N: in a fair game your odds depend only on how far you are from each wall. But ¥1 a round takes {=ch6.nfair} rounds on average, exactly 50 × 50. Starting d steps from each wall, it takes d² steps on average to hit one, chapter 1's square-root law read backwards.

"In an unfavourable game, big stakes and few rounds are better" is a mathematical result (Dubins and Savage showed in 1965 that bold play is optimal in games of this kind), not gambling advice: in an unfavourable game every way of playing succeeds less often than in a fair one, and every one loses on average (see [[expected-value]]). {.take}

## Where it leads: options and diffusion models {#ch7}

::: strings
toc: Options and diffusion models
:::

The same random walk is heat and ink spreading in physics, the price of an option in finance, and in today's AI, "first turn the picture to static, then learn to walk back step by step". {.law}

A cloud of grains spreading as ⟨x²⟩ = 2Dt has a density obeying the **diffusion equation** ∂p/∂t = D ∂²p/∂x², the same as the heat equation. In 1973 Black and Scholes derived an option-pricing equation under geometric Brownian motion that, after a change of variables, is exactly this equation. An option's price depends only on how wide the distribution of future prices is, σ√T, not on which way the average drifts. The derivation is in <a href="../../../investment/derivatives/a-fair-price-for-a-bet/#ch6">chapter 6 of the companion essay</a>; chapter 1's Pascal lattice turns into the <a href="../../../investment/derivatives/a-fair-price-for-a-bet/#ch4">binomial tree</a> that prices options there, and chapter 5's fat tails show up there as the option market's <a href="../../../investment/derivatives/a-fair-price-for-a-bet/#ch8">volatility smile</a>.

In 2015 Sohl-Dickstein and colleagues borrowed an idea from non-equilibrium thermodynamics: add noise to data step by step until it is pure Gaussian noise, then train a neural network to undo it step by step. In 2020 the **denoising diffusion probabilistic model (DDPM)** of Ho, Jain and Abbeel made this reach the best image generation of its time. Its "forward process" is a random walk that shrinks toward the origin:

x<sub>t</sub> = √ᾱ<sub>t</sub> · x<sub>0</sub> + √(1 − ᾱ<sub>t</sub>) · ε,  ε ~ N(0, 1) {#eq2 .eq}

::: diagram dg-bridge keys=dg.br
cap: Figure 7. The two directions of a diffusion model (schematic). Forward: each step shrinks the data a little and adds a little noise; after 1,000 steps only noise is left, and nothing is learned. Reverse: a neural network learns to guess its way back from noise to data step by step, and that is the generation.
aria: Diagram: an upper arrow from data through gradual noising to pure noise, and a lower arrow where a neural network denoises step by step back to data
data: data
noise: pure noise
fwd: forward: add noise (a fixed random walk)
rev: reverse: denoise (learned by a network)
:::

::: lab ch7-model
model.title: Noising two hills into one
model.how: Toy "data": half the points near −2, half near +2. Drag the number of noising steps t (the 1,000-step linear noise schedule of the DDPM paper). The gold curve is the distribution at step t, the dashed cyan curve a standard normal. Watch for the step at which the two hills merge into one.
ctl.t: Noising steps t
read.ab: Signal left √ᾱ
read.noise: Noise SD √(1 − ᾱ)
read.peaks: Shape
peaks.two: two hills
peaks.one: one hill
cv.x: x →
cv.y: ↑ probability density
cv.normal: standard normal
cv.aria: Curve chart: the density of the noised data changes from two peaks into a standard normal distribution
say.two: Step {t}: {ab} of the original signal is left; both hills are still there, only lower and wider.
say.one: Step {t}: {ab} of the signal is left, and the two hills have merged into one. From here on the distribution looks more and more like a standard normal.
:::

Under this schedule the two hills merge at step {=ch7.merge}; by step 1,000 only {=ch7.sig1000} of the original signal remains and the data are almost erased. Each forward step is nothing more than the small random jiggle of chapter 3. The hard part of a generative model is the reverse: the network has to learn, at every step, which way to retreat. That direction is called the **score** (the gradient of the log of the probability density). In 2021 Yang Song and colleagues wrote both directions as stochastic differential equations, joining discrete diffusion models and continuous Brownian motion.

The toy data here are one-dimensional, while real images have hundreds of thousands of dimensions. The forward process is fixed and simple; the quality of what gets generated depends entirely on how well the reverse network learns, and this page does not simulate that half. {.take}

## Where the frontier is: November 2026 {#ch8}

::: strings
toc: Where the frontier is
:::

A random walk from over a century ago is still being corrected: it fails at the shortest time scales, in markets its own volatility wanders randomly, and in AI it has become a mainstream way to generate things. {.law}

### Established {#h.est .sub3}

- **The square-root law and the diffusion equation**: independent increments' variances add, ⟨x²⟩ = 2Dt, and the diffusion equation are foundational results of probability and statistical physics. Einstein's paper reached *Annalen der Physik* on 11 May 1905 (vol. 17, pp. 549–560); Perrin received the Nobel Prize in Physics in 1926. {#e1}
- **Daily index returns have fat tails and volatility clustering**: from Mandelbrot (1963) to Cont's review (2001) these are listed as "stylised facts" across markets, and chapter 5's data show them too. {#e2}
- **Published return patterns weaken**: McLean and Pontiff (*Journal of Finance*, 2016), across 97 variables, found returns 26% lower out of sample and 58% lower after publication. {#e3}

### Demonstrated {#h.demo .sub3}

- **The instantaneous velocity of a Brownian particle**: Einstein thought it could not be measured. In 2010 Raizen's group reported in *Science* that they held a micron-sized glass bead in air with optical tweezers and measured its instantaneous velocity, whose distribution matched Maxwell–Boltzmann. At such short times the bead carries its inertia and moves nearly in a straight line, ⟨x²⟩ grows as t² rather than t, and the random-walk picture holds only after many collisions. {#d1}
- **Diffusion models generate images**: DDPM (2020) reported an FID of 3.17 on CIFAR-10; since then many mainstream image and video generators have been built on diffusion or on the closely related flow-matching methods. {#d2}

### Claimed {#h.claim .sub3}

- **"Volatility is rough"**: Gatheral, Jaisson and Rosenbaum (preprint 2014, published in *Quantitative Finance* 2018) argue that log volatility behaves like a fractional Brownian motion with Hurst exponent about 0.1, much rougher than ordinary Brownian motion (0.5), and derive better volatility forecasts from it. Cont and Das (2024) argue that the roughness may come from microstructure noise in estimating volatility from high-frequency data rather than from volatility itself. The debate continues. {#c1}
- **Whether markets are "efficient"**: supporters of the efficient market hypothesis and behavioural economists read the same evidence (momentum, long-run reversal, decay after publication) differently, the former as risk compensation or data mining, the latter as systematic mispricing. This page does not judge between them. {#c2}

### Three questions to ask of a "random" number {#h.use .sub3}

- **Was it scaled by √T?** An annual volatility of 20% is about 20% × √(1/12) ≈ {=ch8.m1} over a month, not 20% ÷ 12. And when daily data are used to infer long-run risk, remember that the scaling assumes one day is uncorrelated with the next. {#u1}
- **How fat are the tails?** Using a normal distribution to size a "once in a century" bad day badly underestimates it in stock markets: in chapter 5, days beyond 4 standard deviations were {=ch8.o4x} times as frequent as the normal predicts. {#u2}
- **How many rounds?** In a process where each step is slightly against you, the more steps, the surer the bad outcome; when each step is slightly in your favour, the opposite. {#u3}

::: footer
**Sources and data.** NASDAQ Composite daily close: FRED series NASDAQCOM, Federal Reserve Bank of St. Louis (<a href="https://fred.stlouisfed.org/series/NASDAQCOM">fred.stlouisfed.org/series/NASDAQCOM</a>, retrieved 2026-11-25, through 2026-11-16); the page carries summary statistics only. Einstein, A. (1905), Annalen der Physik 17: 549–560. Perrin, J. (1909), Annales de Chimie et de Physique 18: 5–114; the 1926 Nobel citation is at nobelprize.org. Bachelier, L. (1900), Théorie de la spéculation. Mandelbrot, B. (1963), Journal of Business 36(4): 394–419. Gopikrishnan, P. et al. (1998), European Physical Journal B 3: 139–140, arXiv:cond-mat/9803374. Fama, E. (1970), Journal of Finance 25(2): 383–417. Lo, A. and MacKinlay, A. C. (1988), Review of Financial Studies 1(1): 41–66. Jegadeesh, N. and Titman, S. (1993), Journal of Finance 48(1): 65–91. Fama, E. and French, K. (1988), Journal of Political Economy 96(2): 246–273; Poterba, J. and Summers, L. (1988), Journal of Financial Economics 22: 27–59. Cont, R. (2001), Quantitative Finance 1: 223–236. McLean, R. D. and Pontiff, J. (2016), Journal of Finance 71(1): 5–32. Dubins, L. and Savage, L. (1965), How to Gamble If You Must. Black, F. and Scholes, M. (1973), Journal of Political Economy 81(3): 637–654. Sohl-Dickstein, J. et al. (2015), ICML, arXiv:1503.03585. Ho, J., Jain, A. and Abbeel, P. (2020), NeurIPS, arXiv:2006.11239. Song, Y. et al. (2021), ICLR, arXiv:2011.13456. Li, T., Kheifets, S., Medellin, D. and Raizen, M. (2010), Science 328: 1673. Gatheral, J., Jaisson, T. and Rosenbaum, M. (2018), Quantitative Finance 18(6): 933–949, arXiv:1410.3394. Cont, R. and Das, P. (2024), Sankhyā B 86: 191–223, arXiv:2203.13820. {#sources}

**Models.** Every model runs in the browser with fixed random seeds, so runs repeat. Water's viscosity uses the Vogel approximation; the Stokes–Einstein relation is only an order of magnitude for small molecules. The variance-ratio "shuffled range" was computed in advance from {=ch5.shuffles} shuffles with a fixed seed. Both ways of playing gambler's ruin are solved exactly as linear systems. The diffusion model simulates only the forward noising. This is not investment advice, nor gambling advice. {#models}
:::
