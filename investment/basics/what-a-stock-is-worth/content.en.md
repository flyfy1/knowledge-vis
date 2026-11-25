---
lang: en
title: What a Stock Is Worth · A Hands-on Essay
desc: The same company, its business barely changed, can see its share price swing thirty percent in a year. Starting from “a share is a claim on future cash”, the essay works through discounting, the Gordon growth model, P/E and Shiller's CAPE, the equity risk premium, CAPM and factors, efficient markets and excess volatility, why most active funds trail the index, bubbles, and the market concentration and AI-investment debate of November 2026. Ten models you can push, eight diagrams; mechanisms and evidence only, not investment advice.
---

::: strings
nav.back: [EN pending]
nav.lang: [EN pending]
toc.label: [EN pending]
toc.title: [EN pending]
u.pct: {v}%
u.pt: [EN pending] {v}
u.yr: [EN pending] {v}
u.x: [EN pending] {v}
u.money: [EN pending] {v}
u.mo: [EN pending] {v}
u.none: [EN pending]
u.never: [EN pending]
:::

# What a Stock Is Worth {#hero}

::: strings
kicker: [EN pending]
:::

[EN pending] {.sub}

[EN pending] {.lead}

[EN pending] [[compound-interest]] [[risk-return]] [[diversification]] [[why-one-rate-moves-everything]] {.note}

## [EN pending] {#ch1}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-claim keys=dg.claim
cap: [EN pending]
aria: [EN pending]
rev: [EN pending]
cost: [EN pending]
int: [EN pending]
tax: [EN pending]
ni: [EN pending]
div: [EN pending]
buy: [EN pending]
ret: [EN pending]
loop: [EN pending]
first: [EN pending]
last: [EN pending]
:::

[EN pending] [[stocks-bonds]]

[EN pending] {.take}

## [EN pending] {#ch2}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[compound-interest]] [[why-one-rate-moves-everything#ch1|EN pending]]

[EN pending]

[EN pending] {.formula #f1}

[EN pending]

::: lab ch2-model
model.title: [EN pending]
model.how: [EN pending]
ctl.r: [EN pending]
ctl.g: [EN pending]
read.p: [EN pending]
read.s10: [EN pending]
read.s30: [EN pending]
read.half: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.y2: [EN pending]
cv.cash: [EN pending]
cv.pv: [EN pending]
cv.cum: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {r} {g} {p} {s10} {half}
say.none: [EN pending]
:::

[EN pending] {=ch2.P} {=ch2.s10} {=ch2.s30} {=ch2.half}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch3}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

[EN pending] {.formula #f2}

[EN pending]

::: diagram dg-series keys=dg.series
cap: [EN pending]
aria: [EN pending]
y1: [EN pending]
yn: [EN pending]
sum: [EN pending]
q: [EN pending]
:::

::: lab ch3-model
model.title: [EN pending]
model.how: [EN pending]
ctl.r: [EN pending]
ctl.g: [EN pending]
read.p: [EN pending]
read.m: [EN pending]
read.chg: [EN pending]
read.dur: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.asym: r = g
cv.aria: [EN pending]
say.ok: [EN pending] {gap} {p} {p1} {chg}
say.near: [EN pending] {gap} {p} {m} {chg}
say.none: [EN pending]
:::

[EN pending] {=ch3.P} {=ch3.p1} {=ch3.chg} {=ch3.P6} {=ch3.chg6} {=ch3.P7} {=ch3.chg7} {=ch3.chg2}

[EN pending] {=ch3.dur} [[why-one-rate-moves-everything#ch8|EN pending]]

[EN pending] {.take}

## [EN pending] {#ch4}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {=ch4.ey40}

[EN pending] {.formula #f3}

[EN pending]

::: diagram dg-pe keys=dg.pe
cap: [EN pending]
aria: [EN pending]
pe: [EN pending]
eq: =
pay: [EN pending]
div: [EN pending]
den: [EN pending]
r: [EN pending]
g: [EN pending]
:::

[EN pending] {=ch4.g20} {=ch4.g40}

[EN pending]

::: lab ch4-model
model.title: [EN pending]
model.how: [EN pending]
ctl.pe: [EN pending]
ctl.r: [EN pending]
ctl.roe: [EN pending]
ctl.g1: [EN pending]
read.ey: [EN pending]
read.g: [EN pending]
read.pm: [EN pending]
read.n: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {pe} {r} {g1} {n} {pm}
say.low: [EN pending] {pe} {pm}
say.slow: [EN pending] {g1} {r}
say.roe: [EN pending]
:::

[EN pending] {=ch4.pm} {=ch4.N} {=ch4.N15}

[EN pending] {.take}

## [EN pending] {#ch5}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-cape keys=dg.cape
cap: [EN pending]
aria: [EN pending]
e: [EN pending]
rec: [EN pending]
win: [EN pending]
last: [EN pending]
:::

::: lab ch5-model
model.title: [EN pending]
model.how: [EN pending]
ctl.d: [EN pending]
read.tr: [EN pending]
read.cape: [EN pending]
read.base: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.tr: [EN pending]
cv.cape: [EN pending]
cv.rec: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {d} {tlo} {thi} {clo} {chi}
say.flat: [EN pending] {tlo} {clo}
:::

[EN pending] {=ch5.trHi} {=ch5.capeLo} {=ch5.capeHi}

[EN pending] [[where-a-mortgage-payment-goes#ch8|EN pending]] [[why-one-rate-moves-everything#ch4|EN pending]]

[EN pending] {.take}

## [EN pending] {#ch6}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-stack keys=dg.stack
cap: [EN pending]
aria: [EN pending]
rf: [EN pending]
erp: [EN pending]
r: [EN pending]
g: [EN pending]
y: [EN pending]
:::

[EN pending]

::: lab ch6-model
model.title: [EN pending]
model.how: [EN pending]
ctl.y: [EN pending]
ctl.g: [EN pending]
ctl.rf: [EN pending]
ctl.p: [EN pending]
read.r: [EN pending]
read.erp: [EN pending]
read.yld: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {r} {rf} {erp}
say.neg: [EN pending] {erp}
:::

[EN pending] {=ch6.erp} {=ch6.erpDown} {=ch6.erpUp} {=f.erpJan} {=f.erpNov} {=f.tbond}

[EN pending]

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch7}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[diversification]]

[EN pending]

::: lab ch7-model
model.title: [EN pending]
model.how: [EN pending]
ctl.rf: [EN pending]
ctl.erp: [EN pending]
ctl.ind: [EN pending]
ind.power: [EN pending]
ind.food: [EN pending]
ind.drugs: [EN pending]
ind.software: [EN pending]
ind.auto: [EN pending]
ind.semi: [EN pending]
read.beta: [EN pending]
read.req: [EN pending]
read.mkt: [EN pending]
read.n: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.mkt: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {ind} {beta} {req} {diff}
say.lo: [EN pending] {ind} {beta} {req} {diff}
:::

[EN pending] {=f.tbond} {=f.erpNov} {=ch7.power} {=ch7.semi}

[EN pending] [[regression-correlation]]

::: lab ch7-beta keys=ch7.b
model.title: [EN pending]
model.how: [EN pending]
ctl.s: [EN pending]
ctl.n: [EN pending]
btn.again: [EN pending]
read.est: [EN pending]
read.true: [EN pending]
read.se: [EN pending]
read.band: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.true: [EN pending]
cv.fit: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {b} {se} {lo} {hi}
:::

[EN pending] {=ch7.se} {=ch7.lo} {=ch7.hi}

[EN pending]

::: diagram dg-factors keys=dg.factors
cap: [EN pending]
aria: [EN pending]
ret: [EN pending]
rf: [EN pending]
mkt: [EN pending]
smb: [EN pending]
hml: [EN pending]
rmw: [EN pending]
cma: [EN pending]
alpha: [EN pending]
capm: [EN pending]
ff: [EN pending]
:::

[EN pending] {=f.mpOos} {=f.mpPost} [[numbers-lie#c4|EN pending]] [[hypothesis-testing]]

[EN pending] {.take}

## [EN pending] {#ch8}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

[EN pending]

::: lab ch8-model
model.title: [EN pending]
model.how: [EN pending]
ctl.b: [EN pending]
read.sdp: [EN pending]
read.sds: [EN pending]
read.ratio: [EN pending]
read.truth: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.p: [EN pending]
cv.ps: [EN pending]
cv.aria: [EN pending]
say.calm: [EN pending] {ratio}
say.wild: [EN pending] {ratio}
:::

[EN pending] {=ch8.ratioR} {=ch8.ratio95} {=ch8.cross}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch9}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-sharpe keys=dg.sharpe
cap: [EN pending]
aria: [EN pending]
mkt: [EN pending]
idx: [EN pending]
act: [EN pending]
pre: [EN pending]
post: [EN pending]
fee1: [EN pending]
fee2: [EN pending]
:::

[EN pending]

::: lab ch9-model
model.title: [EN pending]
model.how: [EN pending]
ctl.fee: [EN pending]
ctl.skill: [EN pending]
ctl.te: [EN pending]
ctl.close: [EN pending]
read.y1: [EN pending]
read.y10: [EN pending]
read.y20: [EN pending]
read.alive: [EN pending]
read.surv: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.sim: [EN pending]
cv.cf: [EN pending]
cv.spiva: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {y1} {y20} {surv}
say.nofee: [EN pending]
say.skill: [EN pending]
:::

[EN pending] {=ch9.cf1} {=ch9.cf20} {=ch9.alive} {=ch9.sim20} {=ch9.surv} {=ch9.cf20b}

[EN pending] {=f.spiva1} {=f.spiva3} {=f.spiva5} {=f.spiva10} {=f.spiva15} {=f.spiva20} {=f.spivaN} {=f.spivaSurv} {=f.ret500} {=f.retFund} {=f.spivaPrev} {=f.spiva1}

[EN pending] [[numbers-lie]] [[numbers-lie#c3|EN pending]] [[numbers-lie#c1|EN pending]] [[numbers-lie#c2|EN pending]]

[EN pending] [[fees-compounding]]

[EN pending] {.take}

## [EN pending] {#ch10}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-bubble keys=dg.bubble
cap: [EN pending]
aria: [EN pending]
f: [EN pending]
b: [EN pending]
grow: [EN pending]
pop: [EN pending]
:::

::: lab ch10-model
model.title: [EN pending]
model.how: [EN pending]
ctl.pi: [EN pending]
ctl.b0: [EN pending]
btn.again: [EN pending]
read.yr: [EN pending]
read.ratio: [EN pending]
read.grow: [EN pending]
read.life: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.f: [EN pending]
cv.p: [EN pending]
cv.aria: [EN pending]
say.run: [EN pending] {t} {ratio} {grow}
say.pop: [EN pending] {t}
say.end: [EN pending] {p}
:::

[EN pending] {=ch10.grow} {=ch10.life} {=f.nqPeak} {=f.nqTrough} {=f.nqDrop}

[EN pending]

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch11}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

### [EN pending] {#h.est .sub3}

{.fl}
- [EN pending] {#e1}
- [EN pending] {#e2}
- [EN pending] {#e3}
- [EN pending] {#e4}

### [EN pending] {#h.dem .sub3}

{.fl}
- [EN pending] {=f.top10} {=f.top10e} {=f.top10peak} {=f.top10lo} {=f.top10hi} {#d1}
- [EN pending] {=f.capeNow} {=f.cape1999} {=f.capeEy} {#d2}
- [EN pending] {=f.erpNov} {=f.tbond} {=f.erpJan} {#d3}
- [EN pending] {=f.spiva1} {=f.spiva20} {=f.spivaRisk} {#d4}
- [EN pending] {#d5}

### [EN pending] {#h.claim .sub3}

{.fl}
- [EN pending] {#c1}
- [EN pending] {#c2}
- [EN pending] {#c3}

[EN pending] {.take}

## [EN pending] {#ch12}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

{.qs}
- [EN pending] {#q1}
- [EN pending] {#q2}
- [EN pending] {#q3}
- [EN pending] {#q4}

[EN pending] {#sum .sum}

[EN pending] [[compound-interest]] [[interest-rates-bonds]] [[stocks-bonds]] [[risk-return]] [[diversification]] [[fees-compounding]] [[expected-value]] [[why-one-rate-moves-everything]] {#links}

::: footer
[EN pending]

[EN pending]

[EN pending]
:::
