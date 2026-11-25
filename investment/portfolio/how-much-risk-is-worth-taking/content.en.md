---
lang: en
title: How Much Risk Is Worth Taking · A Hands-on Essay
desc: Diversification removes part of the risk; only what is left gets paid. Starting from the risk floor of N assets, this essay derives the efficient frontier, the capital market line and the Sharpe ratio once a risk-free asset is added, then shows why measured Sharpe ratios and “optimal” portfolios are so unreliable. It then leaves the one-period world: volatility drag, why leveraged ETFs shrink over time, the small extra return from rebalancing, and the Kelly criterion, which says how much to bet and why nobody bets the full amount. Nine hands-on models; mechanisms only, not investment advice.
---

::: strings
nav.back: [EN pending]
nav.lang: [EN pending]
toc.label: [EN pending]
toc.title: [EN pending]
a0: [EN pending]
a1: [EN pending]
a2: [EN pending]
a3: [EN pending]
u.pct: {v}%
u.pt: [EN pending] {v}
u.yr: [EN pending] {v}
u.x: [EN pending] {v}
u.n: [EN pending] {v}
u.sr: {v}
btn.again: [EN pending]
:::

# How Much Risk Is Worth Taking {#hero}

::: strings
kicker: [EN pending]
:::

[EN pending] {.sub}

[EN pending] {.lead}

[EN pending] [[central-limit-theorem#step3]] [[diversification]] [[risk-return#step3]] {.note}

## [EN pending] {#ch1}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[diversification#step1|EN pending]] [[diversification#step2|EN pending]]

[EN pending]

[EN pending] {#eq .formula}

::: diagram dg-matrix keys=dg.matrix
cap: [EN pending]
aria: [EN pending]
var: [EN pending]
cov: [EN pending]
lab: [EN pending]
:::

::: lab ch1-model
model.title: [EN pending]
model.how: [EN pending]
ctl.n: [EN pending]
ctl.rho: [EN pending]
ctl.s: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.p: [EN pending]
leg.f: [EN pending]
read.v: [EN pending]
read.f: [EN pending]
read.sh: [EN pending]
read.k: [EN pending]
say.zero: [EN pending] {v}
say.near: [EN pending] {n} {v} {f} {g} {sh}
say.far: [EN pending] {n} {v} {f} {g}
:::

[EN pending] {=ch1.v1} {=ch1.v10} {=ch1.fl} {=ch1.off10} {=ch1.cov10} {=ch1.n10} {=ch1.flb} {=ch1.n10b}

[EN pending] [[risk-pooling]]

[EN pending] {.take}

## [EN pending] {#ch2}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {#eq .formula}

[EN pending]

::: diagram dg-frontier keys=dg.frontier
cap: [EN pending]
aria: [EN pending]
x: [EN pending]
y: [EN pending]
gmv: [EN pending]
eff: [EN pending]
ineff: [EN pending]
:::

::: lab ch2-model
model.title: [EN pending]
model.how: [EN pending]
ctl.a: [EN pending]
ctl.mu: [EN pending]
ctl.sig: [EN pending]
ctl.m: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.ns: [EN pending]
leg.u: [EN pending]
leg.t: [EN pending]
read.vol: [EN pending]
read.w: [EN pending]
read.gmv: [EN pending]
read.u: [EN pending]
say.ok: [EN pending] {m} {v} {a} {av} {d}
say.worse: [EN pending] {m} {v} {a}
say.out: [EN pending] {u}
w.item: {a} {w}
:::

[EN pending] {=ch2.gv} {=ch2.gm} {=ch2.v7} {=ch2.save} {=ch2.w7a} {=ch2.w7b} {=ch2.w7c} {=ch2.w7d} {=ch2.ugv} {=ch2.ugc}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch3}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending]

[EN pending] {#eq .formula}

[EN pending]

::: diagram dg-cml keys=dg.cml
cap: [EN pending]
aria: [EN pending]
rf: [EN pending]
tan: [EN pending]
lend: [EN pending]
borrow: [EN pending]
slope: [EN pending]
:::

::: lab ch3-model
model.title: [EN pending]
model.how: [EN pending]
ctl.rf: [EN pending]
ctl.a: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.f: [EN pending]
leg.cml: [EN pending]
leg.you: [EN pending]
read.sr: [EN pending]
read.w: [EN pending]
read.best: [EN pending]
read.you: [EN pending]
say.lend: [EN pending] {a} {m} {s}
say.all: [EN pending] {m} {s} {sr}
say.borrow: [EN pending] {b} {m} {s} {sr}
:::

[EN pending] {=ch3.tm} {=ch3.ts} {=ch3.sr} {=ch3.w0} {=ch3.w1} {=ch3.w2} {=ch3.w3} {=ch3.sr2} {=ch3.sr1} {=ch3.cm16} {=ch3.m50} {=ch3.s50}

[EN pending] {=ch3.w0rf1} {=ch3.srrf1} [[why-one-rate-moves-everything]]

[EN pending]

[EN pending] [[a-fair-price-for-a-bet#ch8]] {.take}

## [EN pending] {#ch4}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] [[numbers-lie#c2|EN pending]]

[EN pending] {#eq .formula}

[EN pending]

::: lab ch4-model
model.title: [EN pending]
model.how: [EN pending]
ctl.s: [EN pending]
ctl.t: [EN pending]
ctl.k: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.true: [EN pending]
leg.med: [EN pending]
read.se: [EN pending]
read.band: [EN pending]
read.med: [EN pending]
read.gt1: [EN pending]
say.one: [EN pending] {s} {t} {lo} {hi} {neg} {gt1}
say.many: [EN pending] {k} {s} {med} {d}
:::

[EN pending] {=ch4.se} {=ch4.lo} {=ch4.hi} {=ch4.neg} {=ch4.t01}

[EN pending] {=ch4.k20sim} {=ch4.k20} {=ch4.k100} [[numbers-lie#c4|EN pending]]

[EN pending] {.take}

## [EN pending] {#ch5}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {#eq .formula}

[EN pending]

::: diagram dg-sml keys=dg.sml
cap: [EN pending]
aria: [EN pending]
x: [EN pending]
y: [EN pending]
line: [EN pending]
t: [EN pending]
:::

[EN pending] {=ch5.b0} {=ch5.b1} {=ch5.b2} {=ch5.b3} {=ch5.ex} {=ch5.b2} {=ch5.ex}

[EN pending] [[regression-correlation]]

[EN pending] {.take}

## [EN pending] {#ch6}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] {=ch6.p0} {=ch6.p1} {=ch6.q0} {=ch6.q1}

[EN pending] {=ch6.se10} {=ch6.t16}

::: diagram dg-amp keys=dg.amp
cap: [EN pending]
aria: [EN pending]
in: [EN pending]
mu: [EN pending]
cov: [EN pending]
opt: [EN pending]
out: [EN pending]
:::

::: lab ch6-model
model.title: [EN pending]
model.how: [EN pending]
ctl.y: [EN pending]
ctl.k: [EN pending]
k.both: [EN pending]
k.cov: [EN pending]
cv.x: [EN pending]
cv.aria: [EN pending]
cv.aria2: [EN pending]
bar.opt: [EN pending]
bar.est: [EN pending]
bar.eq: [EN pending]
bar.iv: [EN pending]
bar.gmv: [EN pending]
read.se: [EN pending]
read.est: [EN pending]
read.eq: [EN pending]
read.opt: [EN pending]
say.both: [EN pending] {y} {e} {o} {q} {lo} {hi}
say.cov: [EN pending] {y} {e} {o}
:::

[EN pending] {=ch6.e10} {=ch6.opt} {=ch6.eq} {=ch6.lo10} {=ch6.hi10} {=ch6.e100} {=ch6.ek10}

[EN pending]

[EN pending] {=ch6.gmv} {=ch6.iv}

[EN pending] {.take}

## [EN pending] {#ch7}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

::: diagram dg-halves keys=dg.halves
cap: [EN pending]
aria: [EN pending]
start: [EN pending]
up: [EN pending]
dn: [EN pending]
end: [EN pending]
:::

[EN pending] [[a-fair-price-for-a-bet#ch5|EN pending]] [[numbers-lie#c8|EN pending]]

[EN pending] {#eq .formula}

::: lab ch7-model
model.title: [EN pending]
model.how: [EN pending]
ctl.l: [EN pending]
l.1: [EN pending]
l.2: [EN pending]
l.3: [EN pending]
ctl.mu: [EN pending]
ctl.sig: [EN pending]
ctl.y: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.paths: [EN pending]
leg.med: [EN pending]
leg.mean: [EN pending]
read.g: [EN pending]
read.mean: [EN pending]
read.med: [EN pending]
read.below: [EN pending]
say.ok: [EN pending] {L} {g} {y} {mean} {med} {below}
say.neg: [EN pending] {L} {g} {mean} {med} {below}
:::

[EN pending] {=ch7.g1} {=ch7.g2} {=ch7.g3} {=ch7.a3} {=ch7.mean3} {=ch7.med3} {=ch7.below3}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch8}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

[EN pending] {#eq .formula}

[EN pending]

::: diagram dg-rebal keys=dg.rebal
cap: [EN pending]
aria: [EN pending]
bh: [EN pending]
rb: [EN pending]
y: [EN pending]
:::

::: lab ch8-model
model.title: [EN pending]
model.how: [EN pending]
ctl.rho: [EN pending]
ctl.d: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
bar.a: [EN pending]
bar.b: [EN pending]
bar.bh: [EN pending]
bar.rb: [EN pending]
read.dr: [EN pending]
read.vol: [EN pending]
read.rb: [EN pending]
read.win: [EN pending]
say.ok: [EN pending] {rho} {dr} {win}
say.trend: [EN pending] {d} {win}
:::

[EN pending] {=ch8.dr} {=ch8.vol} {=ch8.ga} {=ch8.grb} {=ch8.gbh} {=ch8.win} {=ch8.dr5}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch9}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending] [[exponents-logarithms]] [[expected-value]]

[EN pending]

[EN pending] {#eq .formula}

[EN pending]

::: diagram dg-kelly keys=dg.kelly
cap: [EN pending]
aria: [EN pending]
x: [EN pending]
y: [EN pending]
k: [EN pending]
h: [EN pending]
two: [EN pending]
rf: [EN pending]
:::

::: lab ch9-model
model.title: [EN pending]
model.how: [EN pending]
ctl.mh: [EN pending]
ctl.h: [EN pending]
h.full: [EN pending]
h.half: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
leg.true: [EN pending]
leg.you: [EN pending]
read.f: [EN pending]
read.exp: [EN pending]
read.act: [EN pending]
read.vol: [EN pending]
say.ok: [EN pending] {mh} {f} {ge} {ga} {gs}
say.bad: [EN pending] {mh} {f} {ge} {ga} {r}
:::

[EN pending] {=ch9.f} {=ch9.g} {=ch9.vol} {=ch9.gh} {=ch9.volh} {=ch9.f10} {=ch9.g10} {=ch9.f12} {=ch9.g12} {=ch9.gh12}

[EN pending]

::: lab ch9-coin keys=ch9.c
model.title: [EN pending]
model.how: [EN pending]
ctl.f: [EN pending]
ctl.n: [EN pending]
cv.x: [EN pending]
cv.y: [EN pending]
cv.aria: [EN pending]
read.g: [EN pending]
read.med: [EN pending]
read.below: [EN pending]
read.ruin: [EN pending]
say.up: [EN pending] {f} {g} {n} {med} {below}
say.down: [EN pending] {f} {g} {below} {ruin}
:::

[EN pending] {=ch9.cg} {=ch9.cmed} {=ch9.cg40} {=ch9.cmed40} {=ch9.cruin40}

[EN pending]

[EN pending] {.take}

## [EN pending] {#ch10}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

### [EN pending] {#h.est .sub3}

- [EN pending] {#e1}
- [EN pending] {#e2}

### [EN pending] {#h.factor .sub3}

- [EN pending] {#e3}
- [EN pending] {#e4}
- [EN pending] {#e5}

### [EN pending] {#h.flow .sub3}

- [EN pending] {#e6}

### [EN pending] {#h.ml .sub3}

- [EN pending] {#e7}
- [EN pending] {#e8}

### [EN pending] {#h.open .sub3}

- [EN pending] {#o1}
- [EN pending] {#o2}
- [EN pending] {#o3}

[EN pending] {.take}

## [EN pending] {#ch11}

::: strings
toc: [EN pending]
:::

[EN pending] {.law}

[EN pending]

- [EN pending] {#q1 .qs}
- [EN pending] {#q2}
- [EN pending] {#q3}
- [EN pending] {#q4}
- [EN pending] {#q5}

[EN pending]

::: footer
[EN pending]

[EN pending]

[EN pending]
:::
