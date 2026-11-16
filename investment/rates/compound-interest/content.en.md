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
pageTitle: Compound Interest & Discounting · Time Is the Shape of Money
tagline: When interest earns interest, money grows by multiples; run it backwards and a future amount is worth less today, which is discounting.
docTitle: Compound Interest & Discounting · Time Is the Shape of Money
:::

## Interest on the principal only, or on interest as well: how big is the difference? {#step0 h2=s0t pre=1}

::: strings
nav0: 0 Simple vs compound
:::

::: html step0-1
s0step: "Step 0 · "
s0k: Simple versus compound
:::

<b>This step answers: how much extra does compounding give compared with simple interest?</b> Principal 1000, yearly rate r. Simple interest adds only 1000·r a year, a straight line: A = P(1 + r·t). Compound interest folds interest into the principal and earns on it: A = P(1 + r)ᵗ, a rising curve. The two lines nearly coincide at first and drift apart as time passes. Drag the rate and the years. {#s0e .explain}

::: html step0-2
s0cv: Simple-interest line and compound-interest curve against years
lblRate: Yearly rate r (%)
lblYears: Years t
:::

## Compounding yearly, daily or continuously: does the result grow without bound? {#step1 h2=s1t pre=1}

::: strings
nav1: 1 Compounding frequency
:::

::: html step1-1
s1step: "Step 1 · "
s1k: Compounding frequency
:::

<b>This step answers: is there a ceiling when compounding is split ever finer?</b> Compound m times a year at r/m each time: A = P(1 + r/m)^{m·t}. Larger m gives more, but with shrinking gains, approaching a ceiling P·e^{r·t} (continuous compounding). Yearly, half-yearly, quarterly, monthly and daily differ only slightly, and daily is almost the same as continuous. Pick a frequency and watch the bar and the readout. {#s1e .explain}

::: html step1-2
s1cv: Bars of the final amount for different compounding frequencies, approaching the continuous limit
freq0: yearly
freq1: half-year
freq2: quarterly
freq3: monthly
freq4: daily
freq5: continuous
:::

::: strings
lblBarBase: bars start at {v}
s1ro: {m} compounding, r = {r}%, {t} years: final {v}, which is {gain} more than yearly compounding; the continuous limit is {limit}.
lblExact: exact ln2/ln(1+r)
lblRule: 72 ÷ r
axRate: yearly rate
axDouble: years to double
s2ro: r = {r}%: exact doubling {e} years, the rule of 72 gives {a} (off by {err}%); 1000 compounded for {e} years is {g}.
s3ro: {fv} received in {t} years at r = {r}% has a present value of {pv}; compounding {pv} forward for {t} years gives {back}.
lblDeposits: cumulative deposits
lblInterest: interest
s4ro: Depositing {C} at each year-end at r = {r}% for {n} years: total {fv}, of which deposits {dep} and interest {int} ({share}%).
lblHalfTime: still {b}% left at half of the term
s5ro: Borrow {P} at {r}% for {y} years: monthly payment {pay}, total repaid {tot}, of which interest {int}; at half of the term {half}% of the principal remains.
:::

## How long does it take for money to double, and can you do it in your head? {#step2 h2=s2t pre=1}

::: strings
nav2: 2 Rule of 72
:::

::: html step2-1
s2step: "Step 2 · "
s2k: Doubling and the rule of 72
:::

<b>This step answers: how can you estimate the doubling time?</b> The exact doubling time is t = ln2 / ln(1 + r). The rule of thumb: divide 72 by the rate in percent, e.g. 6% → 12 years. It is accurate for rates around 4%–12% and drifts at very high or very low rates. The orange line is exact, the cyan line is 72/r, and the vertical line is your chosen rate. {#s2e .explain}

::: html step2-2
s2cv: Exact doubling time and the 72/r approximation against the rate
:::

## What is ten thousand received in twenty years worth today? {#step3 h2=s3t pre=1}

::: strings
nav3: 3 Discounting
:::

::: html step3-1
s3step: "Step 3 · "
s3k: Discounting · what is future money worth
:::

<b>This step answers: how do you turn future money into today’s value?</b> Run compounding backwards: present value PV = FV / (1 + r)ᵗ. The higher the rate and the longer the wait, the less it is worth today. The “compound it forward again” line of the readout puts the present value to work for t years at the same rate and lands exactly back on the future amount, showing the two directions are one formula. {#s3e .explain}

::: html step3-2
s3cv: The present value of 10,000 falling with the years of waiting
:::

## If you save the same amount every year, what share of the total is interest? {#step4 h2=s4t pre=1}

::: strings
nav4: 4 Regular saving
:::

::: html step4-1
s4step: "Step 4 · "
s4k: Regular deposits
:::

<b>This step answers: in long-run saving, does the money come mostly from deposits or from interest?</b> Deposit C at the end of each year; after n years FV = C·((1 + r)ⁿ − 1)/r. In each bar cyan is the cumulative deposits and orange is the interest. Interest is small in the early years and the orange grows taller later: the snowball effect. Drag the deposit, the rate and the number of years. {#s4e .explain}

::: html step4-2
s4cv: Yearly stacked bars: cumulative deposits in cyan and interest in orange
lblDeposit: Yearly deposit C
:::

## Under the same interest rule, why does a loan barely reduce the principal early on? {#step5 h2=s5t pre=1}

::: strings
nav5: 5 Loans
:::

::: html step5-1
s5step: "Step 5 · "
s5k: Finale · a loan is compounding the other way
:::

<b>This step answers: how slowly does the principal fall in an equal-payment loan?</b> With monthly rate i = r/12 the monthly payment is M = P·i/(1 − (1 + i)^{−n}). Interest each month is charged on the remaining balance, so early payments are mostly interest and the balance curve is flat at first and steep later. The cyan dot marks the remaining balance at half of the term. Time works for you when saving and for the lender when borrowing. {#s5e .explain}

::: html step5-2
s5cv: Remaining balance of an equal-payment loan falling over time, flat first and steep later
lblLoan: Loan amount (thousands)
lblTerm: Term (years)
recapTitle: Recap
recap1: Compound interest: A = P(1 + r)ᵗ, interest earns interest; simple interest is a line and compound interest curves upward.
recap2: Finer compounding has a ceiling P·e^{rt}; doubling takes about 72/r years; discounting is compounding reversed: PV = FV/(1 + r)ᵗ.
recap3: A regular-saving snowball grows with time; a loan is the same rule in reverse, with early payments mostly interest.
modelTitle: Scope and limits of the model
modelText: Model: a fixed yearly rate and a fixed compounding rule; no inflation, tax, fees, changing rates or default risk. The numbers are for understanding the mechanism and are not investment, loan or tax advice.
link0: → Exponent & Log: compounding is exponential growth and the doubling time comes from a logarithm
link1: → Population Growth: the same “multiply by a factor each period”
link2: → Distributions & Expectation: the mean as a weighted balance point
:::

Page complete. {#done .readout .success i18n=text}

::: strings
lblSimple: simple
lblCompound: compound
axYears: years
s0ro: Principal 1000, r = {r}%, {t} years: simple {a}, compound {b}, a difference of {d} (compound is {x}× simple).
:::
