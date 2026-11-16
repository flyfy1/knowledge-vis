---
lang: en
---

::: strings
back: ← Knowledge Index
category: Probability & Statistics
stage: University
langLabel: Language
navLabel: Step navigation
foot: Built with Claude Sonnet via Mini Claude Code · 由 Claude Sonnet（Mini Claude Code）构建
pageTitle: Markov Chains · The Next Step Depends Only on Now
tagline: Weather, web browsing, a gambler’s fortune: whenever “tomorrow depends only on today”, a steady state emerges from the powers of the transition matrix.
docTitle: Markov Chains · The Next Step Depends Only on Now
:::

## If today is sunny, how likely is rain tomorrow? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 One step
:::

::: html step0-1
s0step: "Step 0 · "
s0k: One step
:::

<b>This step answers: how do transition probabilities decide tomorrow?</b> Two kinds of weather: sunny and rainy. a = the chance sunny turns rainy, b = the chance rainy turns sunny; thicker arrows mean larger probability and the number on each loop is the chance of staying put. The key is “memorylessness”: tomorrow depends only on today, not on the day before. If today is sunny, tomorrow’s distribution is the first row of the transition matrix. Drag a and b (the following steps share the same chain). {#s0e .explain}

::: html step0-2
s0cv: Two states, sunny and rainy, with transition-probability arrows and below it tomorrow’s weather distribution
lblA: Sun → rain a
lblB: Rain → sun b
:::

## Walk on day after day by the transition probabilities: where does the share of sunny days settle? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 A path
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Walking one random path
:::

<b>This step answers: in the long run, what share of days are sunny?</b> At each step the next day is drawn at random from the current state’s transition probabilities. The coloured cells show the last 60 days (orange = sunny, cyan = rainy) and the curve is the share of sunny days so far. After a few hundred days it approaches the dashed line π<sub>sun</sub> = b/(a + b). Changing a or b starts a new chain and clears the path. {#s1e .explain}

::: html step1-2
s1cv: Coloured cells for the last 60 days and the running share of sunny days, with the long-run share dashed
walk10: Walk 10 more days
walk100: Walk 100 more days
walk1000: Walk 1000 more days
reset: Reset
:::

::: strings
lblLast60: last 60 days
axDays: days
axFracSun: share of sunny days
s1ro0: No path yet. Press a Walk button; the long-run sunny share π = {pi}%.
s1ro: After {n} days: {frac}% sunny; theoretical long-run share π = b/(a + b) = {pi}%.
axDaysN: days n
axPSun: P(sunny after n days)
lblStartSun: start sunny
lblStartRain: start rainy
s2ro: n = {n}: row one of Pⁿ gives P(sunny) = {a} (start sunny), row two {b} (start rainy); steady state π = {pi}.
lblMatrix: transition matrix P (row = today, column = tomorrow)
lblPi: stationary distribution π
s3ro: r = {r}: steady state π = sunny {ps}%, cloudy {pc}%, rainy {pr}%; residual max|πP − π| = {res}.
axDist: distance to steady state (log)
kOsc: λ₂ < 0: oscillates while converging
kInstant: λ₂ = 0: settles in one step
kMono: λ₂ > 0: converges monotonically
s4ro: λ₂ = 1 − a − b = {l2} ({kind}); at n = {n} the distance to the steady state is {d}; halving it takes about {half} days.
lblBroke: ruin 0
lblRich: goal 10
s5ro: p = {p}, start {i}, after {n} rounds: ruined {ruin}%, at goal {win}%; the n → ∞ ruin probability is {ru}%, formula {f}%.
:::

## How do we compute the weather distribution n days ahead? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Matrix powers
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Powers of the matrix
:::

<b>This step answers: how are multi-step transitions computed?</b> The n-step transition matrix is the n-th power Pⁿ of the transition matrix P: row i of Pⁿ is the distribution after n steps starting from state i. The curves show the probability of sunshine after n days, orange starting from a sunny day and cyan from a rainy one. The starts differ a lot at first, but the two lines merge into one value π: the chain “forgets” where it began. Drag n. {#s2e .explain}

::: html step2-2
s2cv: The probability of sunshine after n days from a sunny and from a rainy start, merging
lblDays: Days n
:::

## Is there a distribution that is unchanged after one more day? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Steady state
:::

::: html step3-1
s3step: "Step 3 · "
s3k: The stationary distribution
:::

<b>This step answers: what is a stationary distribution and how do we find it?</b> The stationary distribution π satisfies πP = π: after one step of the chain it is unchanged. This step switches to a three-weather chain (sunny, cloudy, rainy) with one knob: the probability r that rain stays rain (the rest is split equally between sunny and cloudy). The bars are π found by multiplying by P over and over, and the “residual” in the readout is the largest entry of πP − π, which should be near 0. The larger r is, the larger the long-run share of rainy days. {#s3e .explain}

::: html step3-2
s3cv: The three-state transition matrix (shade = probability) and the stationary-distribution bars
lblStayRain: Probability rain stays rain r (%)
:::

## How many days must we wait before the weather distribution counts as steady? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 How fast
:::

::: html step4-1
s4step: "Step 4 · "
s4k: How fast it settles
:::

<b>This step answers: what sets the speed of convergence?</b> The transition matrix of a two-state chain has two eigenvalues, 1 and λ₂ = 1 − a − b. The distance to the steady state decays like |λ₂|ⁿ; the vertical axis is logarithmic so this is a straight line with slope log|λ₂|. The smaller |λ₂| is, the faster it settles; with a + b = 1 it settles at the first step; for λ₂ &lt; 0 the distribution oscillates as it converges. The grey line is the theoretical |λ₂|ⁿ. Drag a, b and n. {#s4e .explain}

::: html step4-2
s4cv: The distance to the steady state against days on a log scale with the grey line |λ₂|ⁿ
:::

## Not every chain settles on a “middle” steady state: what finally happens to a gambler’s fortune? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Gambler
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · a chain that never settles in the middle
:::

<b>This step answers: what other fates can a chain have?</b> A gambler wins 1 with probability p and loses 1 with probability 1 − p each round, stopping when the fortune hits 0 (ruin) or 10 (goal): these are “absorbing states” that cannot be left. The bars show the distribution of the fortune after n rounds: as n grows all the mass flows to the two ends and there is no steady state in the middle. The ruin probability has the formula ((q/p)ⁱ − (q/p)ᴺ)/(1 − (q/p)ᴺ) with q = 1 − p, which matches the long-run value from matrix powers. Drag p, the starting fortune and the number of rounds. {#s5e .explain}

::: html step5-2
s5cv: The distribution of the fortune from 0 to 10 after n rounds, with absorbing states at both ends
lblWinP: Win probability per round p
lblStart: Starting fortune
lblRounds: Rounds n
recapTitle: Recap
recap1: A Markov chain: the next step depends only on the current state, and each row of the transition matrix P is a probability distribution.
recap2: The n-step transition is Pⁿ; an ordinary chain converges to a steady state π (πP = π) at a speed set by the second eigenvalue |λ₂|.
recap3: A chain with absorbing states (the gambler) ends in them with no “middle” steady state; web-page ranking is a steady state on the link graph.
modelTitle: Scope and limits of the model
modelText: Model: finitely many states, transition probabilities constant in time and no memory (first order); convergence to a steady state needs the chain to be irreducible and aperiodic, and weather with a = b = 1 would flip every day and never converge. Real weather is certainly not such a simple Markov chain; this only illustrates the idea. The gambler example uses N = 10.
link0: → PageRank: a random surfer on the link graph and its steady state
link1: → Binomial to Normal: counting a multi-step random walk
link2: → Probability & Frequency: long-run frequencies approach probabilities
:::

Page complete. {#done .readout .success i18n=text}

::: strings
stSun: Sunny
stRain: Rainy
stCloud: Cloudy
lblTomorrow: Today sunny, tomorrow’s distribution:
s0ro: a = {a}, b = {b}: today sunny → tomorrow sunny {ps}%, rainy {pr}% (the first row of the matrix); today rainy → tomorrow sunny {ps2}%.
:::
