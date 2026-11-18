---
lang: en
title: How Can a Bet on the Future Have a Fair Price? · A Hands-on Essay
desc: Nobody knows next year's share price, yet options on it trade thousands of times a day at nearly the same price. This essay starts from "a forward price is not a forecast" and climbs through the binomial tree, geometric Brownian motion, the Black–Scholes formula and its partial differential equation, the Greeks and hedging, then shows where it fails: the volatility smile, fat tails, margin and clearing, and the state of the market in November 2026. Thirteen hands-on models. Mathematics and market structure only; not investment advice.
---

::: strings
nav.back: [EN pending]
nav.lang: [EN pending]
toc.label: [EN pending]
toc.title: [EN pending]
u.pct: {v}%
u.pt: [EN pending] {v}
u.yr: [EN pending] {v}
u.mo: [EN pending] {v}
u.day: [EN pending] {v}
u.x: [EN pending] {v}
u.money: [EN pending] {v}
u.steps: [EN pending] {v}
u.times: [EN pending] {v}
u.shares: [EN pending] {v}
u.none: [EN pending]
u.every: [EN pending] {v}
u.everyDays: [EN pending] {v}
u.never: [EN pending]
opt.put: [EN pending]
opt.call: [EN pending]
:::

# How Can a Bet on the Future Have a Fair Price? {#hero}

::: strings
kicker: [EN pending]
:::

[EN pending] {.sub}

[EN pending] {.lead}

[EN pending] [[compound-interest]] [[expected-value]] [[central-limit-theorem]] {.note}

## [EN pending] {#ch1}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {=ch1.F}

::: diagram dg-carry keys=dg.carry
cap: [EN pending] {=ch1.F}
aria: [EN pending]
now: [EN pending]
later: [EN pending]
a1: [EN pending]
b1: [EN pending] {=ch1.F}
a2: [EN pending]
b2: [EN pending]
a3: [EN pending]
b3: [EN pending]
na: [EN pending]
nb: [EN pending] {=ch1.gap}
:::

[EN pending] {=ch1.F} {=ch1.gap}

[EN pending] [[exponents-logarithms]]

::: lab ch1-model
model.title: [EN pending]
model.how: [EN pending]
ctl.r: [EN pending]
ctl.q: [EN pending]
ctl.t: [EN pending]
ctl.f: [EN pending]
read.fair: [EN pending]
read.quote: [EN pending]
read.gap: [EN pending]
read.profit: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.fair: [EN pending]
cv.spot: [EN pending]
cv.aria: [EN pending]
say.carry: [EN pending] {gap} {loan} {units} {fq} {repay} {gap}
say.reverse: [EN pending] {gap} {units} {loan} {repay} {fq} {gap}
say.none: [EN pending]
:::

[EN pending] {=ch1.spot} {=ch1.fDec} {=ch1.fMar}

[EN pending] {.take}

## [EN pending] {#ch2}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-payoff keys=dg.payoff
cap: [EN pending]
aria: [EN pending]
t1: [EN pending]
t2: [EN pending]
t3: [EN pending]
t4: [EN pending]
ax: [EN pending]
:::

[EN pending]

[EN pending]

::: lab ch2-model
model.title: [EN pending]
model.how: [EN pending]
ctl.st: [EN pending]
ctl.k: [EN pending]
st.call: [EN pending]
st.put: [EN pending]
st.protect: [EN pending]
st.fiduciary: [EN pending]
st.covered: [EN pending]
st.straddle: [EN pending]
st.synth: [EN pending]
read.cost: [EN pending]
read.min: [EN pending]
read.max: [EN pending]
read.c: [EN pending]
read.p: [EN pending]
read.cp: [EN pending]
read.rhs: [EN pending]
max.inf: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.sum: [EN pending]
cv.leg.call: [EN pending]
cv.leg.put: [EN pending]
cv.leg.stock: [EN pending]
cv.leg.bond: [EN pending]
cv.aria: [EN pending]
say.call: [EN pending] {cost} {k}
say.put: [EN pending] {cost} {k} {k}
say.protect: [EN pending] {k} {cost}
say.fiduciary: [EN pending] {k} {k} {cost}
say.covered: [EN pending] {cost} {k}
say.straddle: [EN pending] {cost} {k}
say.synth: [EN pending] {k} {cost}
:::

[EN pending] {=ch2.C} {=ch2.P} {=ch2.cp} {=ch2.kf}

[EN pending] {.take}

## [EN pending] {#ch3}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {=ch3.delta} {=ch3.B}

::: diagram dg-onestep keys=dg.onestep
cap: [EN pending]
aria: [EN pending]
s0: [EN pending]
up: [EN pending]
dn: [EN pending]
fu: [EN pending]
fd: [EN pending]
ru: [EN pending]
rd: [EN pending]
rep: [EN pending] {=ch3.delta} {=ch3.B}
pr: [EN pending] {=ch3.cost} {=ch3.B} {=ch3.price}
:::

[EN pending] {=ch3.delta} {=ch3.B} {=ch3.price} {=ch3.price}

[EN pending] {=ch3.naive80} {=ch3.naive30} {=ch3.price} {=ch3.price}

::: lab ch3-model
model.title: [EN pending]
model.how: [EN pending]
ctl.p: [EN pending]
ctl.u: [EN pending]
ctl.d: [EN pending]
ctl.k: [EN pending]
read.delta: [EN pending]
read.b: [EN pending]
read.price: [EN pending]
read.naive: [EN pending]
read.q: [EN pending]
read.ret: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.rep: [EN pending]
cv.naive: [EN pending]
cv.aria: [EN pending]
say.hi: [EN pending] {p} {naive} {price} {gap} {naive} {price} {gap}
say.lo: [EN pending] {p} {naive} {price} {gap} {naive} {gap}
say.eq: [EN pending] {p} {price}
say.zero: [EN pending] {k}
:::

[EN pending] {=ch3.q}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch4}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: diagram dg-tree keys=dg.tree
cap: [EN pending]
aria: [EN pending]
st: [EN pending]
op: [EN pending]
t0: [EN pending]
t3: [EN pending]
back: [EN pending]
:::

[EN pending] {=ch4.n3} {=ch4.n50} {=ch4.n500}

[EN pending] {=ch4.euPut} {=ch4.amPut} {=ch4.early}

::: lab ch4-model
model.title: [EN pending]
model.how: [EN pending]
ctl.n: [EN pending]
ctl.type: [EN pending]
ctl.am: [EN pending]
ctl.k: [EN pending]
type.call: [EN pending]
type.put: [EN pending]
read.tree: [EN pending]
read.bs: [EN pending]
read.diff: [EN pending]
read.early: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.bs: [EN pending]
cv.aria: [EN pending]
say.eu: [EN pending] {n} {tree} {bs} {diff}
say.amPut: [EN pending] {n} {tree} {early}
say.amCall: [EN pending] {n} {tree}
:::

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch5}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] [[binomial-normal]] [[central-limit-theorem]]

[EN pending] {=ch5.day} {=ch5.month} {=ch5.y4}

::: lab ch5-model
model.title: [EN pending]
model.how: [EN pending]
ctl.mu: [EN pending]
ctl.sig: [EN pending]
ctl.t: [EN pending]
ctl.new: [EN pending]
read.band: [EN pending]
read.median: [EN pending]
read.mean: [EN pending]
read.below: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.hx: [EN pending]
cv.hy: [EN pending]
cv.normal: [EN pending]
cv.aria: [EN pending]
cv.haria: [EN pending]
say.up: [EN pending] {t} {lo} {hi} {median} {mean}
say.drag: [EN pending] {t} {mean} {median} {below}
say.down: [EN pending] {t} {mean} {median} {below}
:::

[EN pending]

[EN pending]

[EN pending] [[monte-carlo]] {.take}

## [EN pending] {#ch6}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {#formula .formula}

[EN pending] {=ch6.Nd1} {=ch6.shares} {=ch6.loan} {=ch6.C}

[EN pending]

[EN pending]

[EN pending] {#pdeq .formula}

[EN pending] [[derivative]]

::: diagram dg-stencil keys=dg.stencil
cap: [EN pending]
aria: [EN pending]
ax: [EN pending]
ay: [EN pending]
row0: [EN pending]
st: [EN pending]
edge: [EN pending]
:::

[EN pending]

::: lab ch6-model
model.title: [EN pending]
model.how: [EN pending]
ctl.sc: [EN pending]
ctl.m: [EN pending]
ctl.nt: [EN pending]
ctl.tau: [EN pending]
ctl.sig: [EN pending]
sc.cn: [EN pending]
sc.ex: [EN pending]
m.c: [EN pending]
m.f: [EN pending]
read.pde: [EN pending]
read.bs: [EN pending]
read.diff: [EN pending]
read.need: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.pay: [EN pending]
cv.bs: [EN pending]
cv.pde: [EN pending]
cv.aria: [EN pending]
say.ok: [EN pending] {tau} {pde} {bs} {diff}
say.exok: [EN pending] {nt} {pde} {bs} {need}
say.bad: [EN pending] {nt} {need}
say.zero: [EN pending]
:::

[EN pending] {=ch6.need60} {=ch6.need240} {=ch6.cnErr}

[EN pending] {.take}

## [EN pending] {#ch7}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {=ch6.C}

{.gl}
- [EN pending] {=ch7.delta} {=ch7.delta} {#g1}
- [EN pending] {=ch7.gamma} {#g2}
- [EN pending] {=ch7.vega1} {#g3}
- [EN pending] {=ch7.thetaDay} {#g4}

::: lab ch7-model
model.title: [EN pending]
model.how: [EN pending]
ctl.g: [EN pending]
ctl.s: [EN pending]
ctl.t: [EN pending]
read.price: [EN pending]
read.delta: [EN pending]
read.gamma: [EN pending]
read.vega: [EN pending]
read.theta: [EN pending]
cv.x: [EN pending]
cv.y.delta: [EN pending]
cv.y.gamma: [EN pending]
cv.y.vega: [EN pending]
cv.y.theta: [EN pending]
cv.aria: [EN pending]
say.delta: [EN pending] {s} {t} {v} {v}
say.gamma: [EN pending] {s} {t} {v} {v}
say.vega: [EN pending] {s} {t} {v}
say.theta: [EN pending] {s} {t} {v}
:::

[EN pending]

::: diagram dg-loop keys=dg.loop
cap: [EN pending]
aria: [EN pending]
b1: [EN pending]
b2: [EN pending]
b3: [EN pending]
b4: [EN pending]
end: [EN pending]
note: [EN pending]
:::

[EN pending] {=ch6.C} {=ch7.paths}

::: lab ch7-hedge keys=ch7.h
model.title: [EN pending]
model.how: [EN pending]
ctl.n: [EN pending]
ctl.r: [EN pending]
ctl.new: [EN pending]
read.prem: [EN pending]
read.mean: [EN pending]
read.sd: [EN pending]
read.rel: [EN pending]
read.theory: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.zero: [EN pending]
cv.mean: [EN pending]
cv.aria: [EN pending]
say.fair: [EN pending] {n} {mean} {se} {sd} {rel}
say.calm: [EN pending] {r} {mean} {theory}
say.wild: [EN pending] {r} {loss} {theory}
:::

[EN pending] {=ch7.sd4} {=ch7.sd52} {=ch7.sd252} {=ch7.rel252} {=ch6.C}

[EN pending] {=ch7.loss30} {=ch7.gain10}

[EN pending] {.take}

## [EN pending] {#ch8}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[interest-rates-bonds]]

[EN pending]

::: lab ch8-model
model.title: [EN pending]
model.how: [EN pending]
ctl.e: [EN pending]
ctl.k: [EN pending]
e.dec: [EN pending]
e.mar: [EN pending]
read.f: [EN pending]
read.atm: [EN pending]
read.iv: [EN pending]
read.mkt: [EN pending]
read.flat: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.pts: [EN pending]
cv.flat: [EN pending]
cv.aria: [EN pending]
say.below: [EN pending] {k} {off} {opt} {mkt} {iv} {atm} {flat} {ratio}
say.above: [EN pending] {k} {off} {opt} {mkt} {iv} {atm} {flat} {ratio}
say.atm: [EN pending] {k} {iv}
:::

[EN pending] {=ch8.atm} {=ch8.p90} {=ch8.ratio}

[EN pending] {=ch1.fDec}

[EN pending]

::: lab ch8-tails keys=ch8.t
model.title: [EN pending]
model.how: [EN pending] {=ch8.n}
ctl.k: [EN pending]
read.pct: [EN pending]
read.obs: [EN pending]
read.exp: [EN pending]
read.ratio: [EN pending]
read.freq: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.normal: [EN pending]
cv.data: [EN pending]
cv.ax: [EN pending]
cv.ay: [EN pending]
cv.abs: [EN pending]
cv.raw: [EN pending]
cv.aria: [EN pending]
cv.aaria: [EN pending]
say.some: [EN pending] {k} {pct} {exp} {obs} {ratio}
say.none: [EN pending] {k} {pct} {exp} {freq} {yrs} {obs}
:::

[EN pending] {=ch8.from} {=ch8.to} {=ch8.n} {=ch8.sd} {=ch8.exp5} {=ch8.obs5} {=ch8.kurt} {=ch8.oct19} {=ch8.z87} {=ch8.log87} {=f.djia87} {=ch8.worstPct}

[EN pending] {=ch8.acfRaw1} {=ch8.acfAbs1} {=ch8.acfAbs20}

[EN pending] {=f.ltcmLev} {=f.ltcmAug} {=f.ltcmFirms} [[diversification]]

[EN pending] {.take}

## [EN pending] {#ch9}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {#heston .formula}

[EN pending]

::: lab ch9-model
model.title: [EN pending]
model.how: [EN pending]
ctl.rho: [EN pending]
ctl.xi: [EN pending]
ctl.new: [EN pending]
read.atm: [EN pending]
read.lo: [EN pending]
read.hi: [EN pending]
read.skew: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.pts: [EN pending]
cv.flat: [EN pending]
cv.aria: [EN pending]
say.left: [EN pending] {rho} {lo} {hi} {skew}
say.right: [EN pending] {rho} {lo} {hi} {skew}
say.sym: [EN pending] {rho} {lo} {atm} {hi}
say.flat: [EN pending] {atm}
:::

[EN pending] {=ch9.rho0} {=ch9.xi0} {=ch9.iv80} {=ch9.iv100} {=ch9.iv120}

[EN pending]

[EN pending]

[EN pending]

::: lab ch9-margin keys=ch9.m
model.title: [EN pending]
model.how: [EN pending]
ctl.im: [EN pending]
ctl.sig: [EN pending]
ctl.res: [EN pending]
ctl.new: [EN pending]
read.lev: [EN pending]
read.calls: [EN pending]
read.out: [EN pending]
read.raw: [EN pending]
read.stat: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.price: [EN pending]
cv.eq: [EN pending]
cv.call: [EN pending]
cv.aria: [EN pending]
say.closed: [EN pending] {d} {loss} {im} {frac} {end} {after}
after.up: [EN pending]
after.down: [EN pending]
say.calls: [EN pending] {n} {paid} {out} {raw} {paid}
say.quiet: [EN pending] {raw} {im} {frac}
:::

[EN pending] {=ch9.closed} {=ch9.won}

[EN pending]

::: diagram dg-ccp keys=dg.ccp
cap: [EN pending]
aria: [EN pending]
t1: [EN pending]
t2: [EN pending]
ccp: [EN pending]
s1: [EN pending] {=ch9.gross} {=ch9.bil}
s2: [EN pending] {=ch9.ccp}
:::

[EN pending] {=ch9.gross} {=ch9.bil} {=ch9.ccp}

[EN pending] {.take}

## [EN pending] {#ch10}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

::: lab ch10-model
model.title: [EN pending]
model.how: [EN pending]
ctl.h: [EN pending]
ctl.rho: [EN pending]
read.sd0: [EN pending]
read.sd: [EN pending]
read.cut: [EN pending]
read.hs: [EN pending]
read.best: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.raw: [EN pending]
cv.hed: [EN pending]
cv.cx: [EN pending]
cv.cy: [EN pending]
cv.aria: [EN pending]
cv.caria: [EN pending]
say.under: [EN pending] {h} {sd0} {sd} {cut} {hs}
say.best: [EN pending] {h} {sd0} {sd} {cut} {best}
say.over: [EN pending] {h} {hs} {sd}
say.spec: [EN pending] {h} {sd} {sd0}
:::

[EN pending] {=ch10.cut90} {=ch10.cut70}

[EN pending]

[EN pending] {=f.bisNotional} {=f.bisGmv} {=f.gmvPct}

::: diagram dg-notional keys=dg.notional
cap: [EN pending]
aria: [EN pending]
n: [EN pending] {=f.bisNotional}
g: [EN pending] {=f.bisGmv}
:::

[EN pending] {=f.sebiLoss} {=f.sebiLoss3} {=f.sebiWin5} {=f.sebiLose5} {=f.sebiBuyers}

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
- [EN pending] {=f.sofr} {=f.irdShare} {#e2}
- [EN pending] {#e3}

### [EN pending] {#h.dem .sub3}

{.fl}
- [EN pending] {=f.bisNotional} {=f.bisYoy} {=f.bisGmv} {=f.bisDecNotional} {=f.bisDecGmv} {=f.triIrd} {#d1}
- [EN pending] {=f.fiaChg} {=f.fiaOptChg} {=f.fiaFutChg} {#d2}
- [EN pending] {=f.zeroShare} {#d3}
- [EN pending] {#d4}
- [EN pending] {#d5}
- [EN pending] {#d6}

::: diagram dg-perp keys=dg.perp
cap: [EN pending]
aria: [EN pending]
t1: [EN pending]
t2: [EN pending]
spot: [EN pending]
fut: [EN pending]
perp: [EN pending]
exp: [EN pending]
fund: [EN pending]
noexp: [EN pending]
:::

### [EN pending] {#h.claim .sub3}

{.fl}
- [EN pending] {=f.mmGamma} {=f.retailLo} {=f.retailHi} {#c1}
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

[EN pending] [[compound-interest]] [[expected-value]] [[binomial-normal]] [[central-limit-theorem]] [[monte-carlo]] [[risk-return]] [[diversification]] [[interest-rates-bonds]] [[where-a-mortgage-payment-goes]] {#links}

::: footer
[EN pending]

[EN pending]

[EN pending]
:::
